// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import {
    Component,
    computed,
    DestroyRef,
    Directive,
    inject,
    input,
    output,
    type TemplateRef,
    untracked,
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
import { MatProgressBar } from "@angular/material/progress-bar";
import {
    MatStep,
    MatStepLabel,
    MatStepper,
    MatStepperNext,
    MatStepperPrevious,
} from "@angular/material/stepper";
import { MatTooltip } from "@angular/material/tooltip";
import { RouterLink } from "@angular/router";

import type { AppListingText } from "../../../domain/app-listing";
import { UNAUTHENTICATED_MESSAGE, UNAVAILABLE_MESSAGE } from "../../../domain/error-messages";
import {
    AppListingTextEditor,
    type AppListingTextSaveError,
} from "../app-listing-text-editor/app-listing-text-editor";
import { ErrorAlert } from "../error-alert/error-alert";
import { LoadingButton, type LoadingButtonState } from "../loading-button/loading-button";

/**
 * The outputs shared by an {@link AppDraftEditorContent} and the page which forwards them.
 */
@Directive()
export abstract class AppDraftEditorOutputs {
    /**
     * Emits when the user submits the listing text they want to save.
     */
    readonly saveListing = output<AppListingText>();

    /**
     * Emits when the user wants to load the latest version of the listing.
     */
    readonly reloadListing = output<void>();

    /**
     * Emits when the user confirms deleting the app draft.
     */
    readonly deleteAppDraft = output<void>();

    /**
     * Emits when the user dismisses the error from saving the listing.
     */
    readonly dismissSaveListingError = output<void>();

    /**
     * Emits when the user dismisses an error from deleting the app draft either directly or by
     * closing the deletion dialog.
     */
    readonly dismissDeleteAppDraftError = output<void>();
}

/**
 * The content of the page for filling in an app draft which has loaded.
 */
@Component({
    imports: [
        AppListingTextEditor,
        ErrorAlert,
        LoadingButton,
        MatButton,
        MatDialogActions,
        MatDialogClose,
        MatDialogContent,
        MatDialogTitle,
        MatIcon,
        MatProgressBar,
        MatStep,
        MatStepLabel,
        MatStepper,
        MatStepperNext,
        MatStepperPrevious,
        MatTooltip,
        RouterLink,
    ],
    selector: "acc-app-draft-editor-content",
    templateUrl: "./app-draft-editor-content.html",
    providers: [
        // Mark completed steps with a check instead of an edit icon
        { provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false } },
    ],
})
export class AppDraftEditorContent extends AppDraftEditorOutputs {
    private readonly destroyRef = inject(DestroyRef);
    private readonly dialog = inject(MatDialog);

    /**
     * The UI state of the app draft editor.
     */
    readonly state = input.required<AppDraftEditorContentState>();

    private readonly deleteDialogTemplate =
        viewChild.required<TemplateRef<unknown>>("deleteDialog");
    private readonly deleteButton = viewChild(LoadingButton);

    /**
     * The steps the user has to complete before submitting the app draft.
     */
    protected readonly steps = computed((): readonly Step[] => [
        {
            id: "listing",
            title: "Add store listing",
            complete: this.state().listing !== undefined,
        },
        { id: "icon", title: "Upload icon", complete: false },
        { id: "appPackage", title: "Upload package", complete: false },
    ]);

    protected readonly completedStepCount = computed(
        () => this.steps().filter((step) => step.complete).length,
    );

    /**
     * The index of the step which should be selected when the page initially loads. Corresponds to
     * the first step the user hasn't completed, or the first step if they've completed them all.
     */
    protected readonly initiallySelectedStepIndex = computed(() =>
        Math.max(
            untracked(this.steps).findIndex((step) => !step.complete),
            0,
        ),
    );

    protected openDeleteDialog(): void {
        let destroyed = false;
        const dialogRef = this.dialog.open(this.deleteDialogTemplate(), {
            // Forbid closing the dialog while deletion is in progress so the user doesn't miss the
            // operation's outcome, but allow closing it when this component is being destroyed so
            // the dialog doesn't stay onscreen after it stops applying.
            closePredicate: () => destroyed || this.state().deleteAppDraftState === "idle",
        });

        // Close the dialog when this component is destroyed, e.g., when navigating away after
        // deleting the app draft succeeds or when the page stops being loaded
        const removeCloseOnDestroy = this.destroyRef.onDestroy(() => {
            destroyed = true;
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
            case "unauthenticated":
                return UNAUTHENTICATED_MESSAGE;
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
 * A step of filling in an app draft.
 */
interface Step {
    readonly id: StepId;
    readonly title: string;
    readonly complete: boolean;
}

type StepId = "listing" | "icon" | "appPackage";

/**
 * The state of an {@link AppDraftEditorContent}.
 */
export interface AppDraftEditorContentState {
    /**
     * The app draft's store listing, if one has been created.
     */
    readonly listing?: AppListingText;

    /**
     * The state of saving the listing's text.
     */
    readonly saveListingState: LoadingButtonState;

    /**
     * The error from the last attempt to save the listing's text, if applicable.
     */
    readonly saveListingError?: AppListingTextSaveError;

    /**
     * The state of reloading the listing's text.
     */
    readonly reloadListingState: LoadingButtonState;

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
 * An error which occurs when attempting to delete an app draft from an
 * {@link AppDraftEditorContent}.
 *
 * - `unauthenticated`: the user isn't logged in.
 * - `permissionDenied`: the user isn't allowed to delete the app draft.
 * - `unavailable`: deletion failed for a reason outside of the user's control.
 */
export interface AppDraftEditorDeleteAppDraftError {
    readonly kind: "unauthenticated" | "permissionDenied" | "unavailable";

    /**
     * The number of failed attempts in a row to delete the app draft.
     */
    readonly failedAttempts: number;
}
