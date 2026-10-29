// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import {
    Component,
    DestroyRef,
    inject,
    input,
    output,
    type TemplateRef,
    viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatButton } from "@angular/material/button";
import {
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
} from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";

import { UNAVAILABLE_MESSAGE } from "../../../domain/error-messages";
import { ErrorAlert } from "../error-alert/error-alert";
import { LoadingButton, type LoadingButtonState } from "../loading-button/loading-button";

/**
 * The page for filling in a given app draft.
 */
@Component({
    imports: [
        ErrorAlert,
        LoadingButton,
        MatButton,
        MatDialogActions,
        MatDialogClose,
        MatDialogContent,
        MatDialogTitle,
        MatIcon,
    ],
    selector: "acc-app-draft-editor-page",
    templateUrl: "./app-draft-editor-page.html",
})
export class AppDraftEditorPage {
    private readonly destroyRef = inject(DestroyRef);
    private readonly dialog = inject(MatDialog);

    /**
     * The UI state of the app draft editor page.
     */
    readonly state = input.required<AppDraftEditorPageState>();

    /**
     * Emits when the user confirms deleting the app draft.
     */
    readonly deleteAppDraft = output<void>();

    /**
     * Emits when the user dismisses an error from deleting the app draft either directly or by
     * closing the deletion dialog.
     */
    readonly dismissDeleteAppDraftError = output<void>();

    private readonly deleteDialogTemplate =
        viewChild.required<TemplateRef<unknown>>("deleteDialog");
    private readonly deleteButton = viewChild(LoadingButton);

    protected openDeleteDialog(): void {
        let pageDestroyed = false;
        const dialogRef = this.dialog.open(this.deleteDialogTemplate(), {
            // Forbid closing the dialog while deletion is in progress so the user doesn't miss the
            // operation's outcome, but allow closing it when the page is being destroyed so the
            // dialog doesn't stay onscreen after navigating away.
            closePredicate: () => pageDestroyed || this.state().deleteAppDraftState === "idle",
        });

        // Close the dialog when the page is destroyed, e.g., when navigating away after deleting
        // the app draft succeeds
        const removeCloseOnDestroy = this.destroyRef.onDestroy(() => {
            pageDestroyed = true;
            dialogRef.close();
        });
        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                removeCloseOnDestroy();
                this.dismissDeleteAppDraftError.emit();
            });
    }

    protected deleteAppDraftErrorMessage(error: AppDraftEditorDeleteAppDraftError): string {
        switch (error.kind) {
            case "permissionDenied":
                return "You don't have permission to delete this app draft.";
            case "unavailable":
                return UNAVAILABLE_MESSAGE;
        }
    }

    protected dismissDeleteError(): void {
        // Focus the delete button when dismissing the error so that focus doesn't fall back to the
        // dialog when the error's dismiss button is removed. This behavior is especially important
        // for users with accessibility needs.
        this.deleteButton()?.focus();
        this.dismissDeleteAppDraftError.emit();
    }
}

/**
 * The state of an {@link AppDraftEditorPage}.
 */
export interface AppDraftEditorPageState {
    /**
     * The state of deleting the app draft.
     */
    readonly deleteAppDraftState: LoadingButtonState;

    /**
     * The error from the last attempt to delete the app draft, if applicable.
     */
    readonly deleteAppDraftError?: AppDraftEditorDeleteAppDraftError;
}

/**
 * An error which occurs when attempting to delete an app draft from an {@link AppDraftEditorPage}.
 *
 * - `permissionDenied`: the user isn't allowed to delete the app draft.
 * - `unavailable`: deletion failed for a reason outside of the user's control.
 */
export interface AppDraftEditorDeleteAppDraftError {
    readonly kind: "permissionDenied" | "unavailable";

    /**
     * The number of failed attempts in a row to delete the app draft.
     */
    readonly failedAttempts: number;
}
