// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import {
    Component,
    computed,
    effect,
    inject,
    input,
    linkedSignal,
    PendingTasks,
    resource,
    type ResourceStatus,
    signal,
} from "@angular/core";
import { Router } from "@angular/router";

import { ok, type Result } from "../../../core/result";
import type { AppListingText } from "../../../domain/app-listing";
import { withDeferredProgress } from "../../../domain/delay";
import type {
    CreateAppDraftListingTextError,
    DeleteAppDraftError,
    UpdateAppDraftListingTextError,
} from "../../../domain/ports/console/errors";
import { CONSOLE_API } from "../../tokens";
import type { AppDraftEditorDeleteAppDraftError } from "../app-draft-editor-content/app-draft-editor-content";
import {
    AppDraftEditorPage,
    type AppDraftEditorPageState,
} from "../app-draft-editor-page/app-draft-editor-page";
import type { AppListingTextSaveError } from "../app-listing-text-editor/app-listing-text-editor";
import type { AppDraftResource } from "../full-page-error-view/full-page-error-view";
import type { LoadingButtonState } from "../loading-button/loading-button";

/**
 * Effectful container for the app draft editor page which loads the app draft and executes app
 * draft operations.
 */
@Component({
    imports: [AppDraftEditorPage],
    selector: "acc-app-draft-editor-container",
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
     * Whether loading the app draft has taken long enough to show progress.
     */
    private readonly showProgress = signal(false);

    private readonly details = resource({
        params: () => ({ appDraftId: this.appDraftId() }),
        loader: ({ params, abortSignal }) => {
            this.showProgress.set(false);
            return withDeferredProgress(
                this.consoleApi.getAppDraftDetails(params, abortSignal),
                () => this.showProgress.set(true),
            );
        },
    });

    /**
     * The state of saving the listing's text.
     */
    private readonly saveListingState = signal<LoadingButtonState>("idle");

    /**
     * The error from the last attempt to save the listing's text, if applicable.
     *
     * The error stays while reloading the listing to recover from it so that the reload button can
     * show progress, then resets since it no longer applies.
     */
    private readonly saveListingError = linkedSignal<
        ResourceStatus,
        AppListingTextSaveError | undefined
    >({
        source: () => this.details.status(),
        computation: (status, previous) => (status === "resolved" ? undefined : previous?.value),
    });

    /**
     * The state of reloading the listing's text.
     */
    private readonly reloadListingState = computed((): LoadingButtonState => {
        if (this.details.status() !== "reloading") {
            return "idle";
        }
        return this.showProgress() ? "loading" : "pending";
    });

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

    protected readonly state = computed((): AppDraftEditorPageState => {
        const resource: AppDraftResource = { kind: "appDraft", id: this.appDraftId() };
        const progress = { kind: this.showProgress() ? "loading" : "pending" } as const;
        if (this.details.status() === "error") {
            return { kind: "error", error: { kind: "unavailable", resource } };
        }
        if (!this.details.hasValue()) {
            return progress;
        }

        const result = this.details.value();
        if (result.ok) {
            return {
                kind: "loaded",
                value: {
                    listing: result.value.listingText,
                    saveListingState: this.saveListingState(),
                    saveListingError: this.saveListingError(),
                    reloadListingState: this.reloadListingState(),
                    deleteAppDraftState: this.deleteAppDraftState(),
                    deleteAppDraftError: this.deleteAppDraftError(),
                },
            };
        }

        switch (result.error.kind) {
            // Keep showing the same progress state while redirecting to the login page
            case "unauthenticated":
                return progress;
            case "permissionDenied":
                return { kind: "error", error: { kind: "permissionDenied", resource } };
            case "internal":
            case "serviceUnavailable":
            case "unknown":
                return { kind: "error", error: { kind: "unavailable", resource } };
        }
    });

    constructor() {
        // Redirect the user to the login page if authentication fails while loading the app draft
        effect(() => {
            if (!this.details.hasValue()) {
                return;
            }
            const result = this.details.value();
            if (!result.ok && result.error.kind === "unauthenticated") {
                void this.router.navigate(["/login"], { replaceUrl: true });
            }
        });
    }

    /**
     * Saves the listing's text, creating it if the app draft doesn't have any yet and displaying
     * an error on failure.
     */
    protected saveListing(listing: AppListingText): void {
        this.saveListingState.set("pending");
        // Run as a pending task so that the app isn't considered stable until we've updated the
        // listing or displayed an error
        this.pendingTasks.run(() => this.trySaveListing(listing));
    }

    private async trySaveListing(listing: AppListingText): Promise<void> {
        const result = await withDeferredProgress(this.writeListing(listing), () =>
            this.saveListingState.set("loading"),
        );

        if (result.ok) {
            this.saveListingError.set(undefined);
            // Keep the new etag so that the next save doesn't look like a conflicting update
            this.details.set(ok({ listingText: { ...listing, etag: result.value.etag } }));
        } else {
            const failedAttempts = (this.saveListingError()?.failedAttempts ?? 0) + 1;
            this.saveListingError.set(toSaveListingError(result.error, failedAttempts));
        }

        this.saveListingState.set("idle");
    }

    private writeListing(
        listing: AppListingText,
    ): Promise<
        Result<
            { readonly etag: string },
            CreateAppDraftListingTextError | UpdateAppDraftListingTextError
        >
    > {
        const appDraftId = this.appDraftId();
        const details = this.details.value();
        const listingText = details?.ok ? details.value.listingText : undefined;
        return listingText === undefined
            ? this.consoleApi.createAppDraftListingText({ appDraftId, ...listing })
            : this.consoleApi.updateAppDraftListingText({
                  appDraftId,
                  etag: listingText.etag,
                  ...listing,
              });
    }

    protected dismissSaveListingError(): void {
        this.saveListingError.set(undefined);
    }

    /**
     * Loads the latest version of the listing.
     */
    protected reloadListing(): void {
        this.details.reload();
    }

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

function toSaveListingError(
    error: CreateAppDraftListingTextError | UpdateAppDraftListingTextError,
    failedAttempts: number,
): AppListingTextSaveError {
    switch (error.kind) {
        case "unauthenticated":
        case "permissionDenied":
            return { kind: error.kind, failedAttempts };
        case "alreadyExists":
        case "etagMismatch":
            return { kind: "conflict", failedAttempts };
        case "internal":
        case "serviceUnavailable":
        case "unknown":
            return { kind: "unavailable", failedAttempts };
    }
}

function toPageError(
    error: DeleteAppDraftError,
    failedAttempts: number,
): AppDraftEditorDeleteAppDraftError {
    switch (error.kind) {
        case "unauthenticated":
        case "permissionDenied":
            return { kind: error.kind, failedAttempts };
        case "internal":
        case "serviceUnavailable":
        case "unknown":
            return { kind: "unavailable", failedAttempts };
    }
}
