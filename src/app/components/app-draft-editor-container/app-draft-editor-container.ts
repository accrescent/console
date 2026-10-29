// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, computed, inject, input, PendingTasks, signal } from "@angular/core";
import { Router } from "@angular/router";

import { withDeferredProgress } from "../../../domain/delay";
import type { DeleteAppDraftError } from "../../../domain/ports/console/errors";
import { CONSOLE_API } from "../../tokens";
import {
    type AppDraftEditorDeleteAppDraftError,
    AppDraftEditorPage,
    type AppDraftEditorPageState,
} from "../app-draft-editor-page/app-draft-editor-page";
import type { LoadingButtonState } from "../loading-button/loading-button";

/**
 * Effectful container for the app draft editor page which executes app draft operations.
 */
@Component({
    imports: [AppDraftEditorPage],
    selector: "acc-app-draft-editor-container",
    host: { class: "block h-full" },
    templateUrl: "./app-draft-editor-container.html",
})
export class AppDraftEditorContainer {
    private readonly consoleApi = inject(CONSOLE_API);
    private readonly pendingTasks = inject(PendingTasks);
    private readonly router = inject(Router);

    /**
     * The ID of the organization the app draft belongs to.
     */
    readonly orgId = input.required<string>();

    /**
     * The ID of the app draft to edit.
     */
    readonly appDraftId = input.required<string>();

    /**
     * The state of deleting the app draft.
     */
    private readonly deleteAppDraftState = signal<LoadingButtonState>("idle");

    /**
     * The error from the last attempt to delete the app draft, if applicable.
     */
    private readonly deleteAppDraftError = signal<AppDraftEditorDeleteAppDraftError | undefined>(
        undefined,
    );

    protected readonly state = computed((): AppDraftEditorPageState => ({
        deleteAppDraftState: this.deleteAppDraftState(),
        deleteAppDraftError: this.deleteAppDraftError(),
    }));

    /**
     * Deletes the app draft and sends the user to the dashboard, displaying an error on failure.
     */
    protected deleteAppDraft(): void {
        this.deleteAppDraftState.set("pending");
        // Run as a pending task so that the app isn't considered stable until we've navigated or
        // displayed an error
        this.pendingTasks.run(() => this.tryDeleteAppDraft());
    }

    private async tryDeleteAppDraft(): Promise<void> {
        const result = await withDeferredProgress(
            this.consoleApi.deleteAppDraft({ appDraftId: this.appDraftId() }),
            () => this.deleteAppDraftState.set("loading"),
        );

        if (result.ok) {
            this.deleteAppDraftError.set(undefined);
            // Replace the URL since the app draft no longer exists to go back to
            await this.router.navigate(["/orgs", this.orgId(), "dashboard"], { replaceUrl: true });
        } else if (result.error.kind === "unauthenticated") {
            this.deleteAppDraftError.set(undefined);
            await this.router.navigate(["/login"], { replaceUrl: true });
        } else {
            const failedAttempts = (this.deleteAppDraftError()?.failedAttempts ?? 0) + 1;
            this.deleteAppDraftError.set(toPageError(result.error, failedAttempts));
        }

        // Reset even after navigation since it could have been cancelled
        this.deleteAppDraftState.set("idle");
    }

    protected dismissDeleteAppDraftError(): void {
        this.deleteAppDraftError.set(undefined);
    }
}

function toPageError(
    error: Exclude<DeleteAppDraftError, { kind: "unauthenticated" }>,
    failedAttempts: number,
): AppDraftEditorDeleteAppDraftError {
    switch (error.kind) {
        case "permissionDenied":
            return { kind: error.kind, failedAttempts };
        case "internal":
        case "serviceUnavailable":
        case "unknown":
            return { kind: "unavailable", failedAttempts };
    }
}
