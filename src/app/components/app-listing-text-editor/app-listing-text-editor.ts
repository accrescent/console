// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, computed, input, linkedSignal, output, viewChild } from "@angular/core";
import {
    disabled,
    form,
    FormField,
    FormRoot,
    maxLengthError,
    readonly,
    required,
    validate,
    type FieldValidator,
    type PathKind,
} from "@angular/forms/signals";
import { MatButton } from "@angular/material/button";
import { MatError, MatFormField, MatHint, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatOption, MatSelect } from "@angular/material/select";
import { RouterLink } from "@angular/router";

import { codePointLength } from "../../../core/code-points";
import {
    LISTING_LANGUAGES,
    LISTING_NAME_MAX_LENGTH,
    LISTING_SHORT_DESCRIPTION_MAX_LENGTH,
    listingLanguageName,
    type AppListingText,
} from "../../../domain/app-listing";
import { UNAUTHENTICATED_MESSAGE, UNAVAILABLE_MESSAGE } from "../../../domain/error-messages";
import { ErrorAlert } from "../error-alert/error-alert";
import { LoadingButton, type LoadingButtonState } from "../loading-button/loading-button";

/**
 * An editor for the text of an app's listing.
 */
@Component({
    imports: [
        ErrorAlert,
        FormField,
        FormRoot,
        LoadingButton,
        MatButton,
        MatError,
        MatFormField,
        MatHint,
        MatInput,
        MatLabel,
        MatOption,
        MatSelect,
        RouterLink,
    ],
    selector: "acc-app-listing-text-editor",
    templateUrl: "./app-listing-text-editor.html",
})
export class AppListingTextEditor {
    protected readonly languages = LISTING_LANGUAGES;
    protected readonly languageName = listingLanguageName;
    protected readonly codePointLength = codePointLength;
    protected readonly nameMaxLength = LISTING_NAME_MAX_LENGTH;
    protected readonly shortDescriptionMaxLength = LISTING_SHORT_DESCRIPTION_MAX_LENGTH;

    /**
     * The listing to edit, or `undefined` if the app doesn't have one yet.
     */
    readonly listing = input.required<AppListingText | undefined>();

    /**
     * The state of saving the listing's text. While saving, the editor doesn't emit {@link save}
     * events.
     */
    readonly saveState = input.required<LoadingButtonState>();

    /**
     * The error from the last attempt to save the listing's text, if applicable.
     */
    readonly saveError = input.required<AppListingTextSaveError | undefined>();

    /**
     * The state of reloading the listing's text. While reloading, the editor doesn't emit
     * {@link save} events.
     */
    readonly reloadState = input.required<LoadingButtonState>();

    /**
     * Emits the listing with the text the user wants to save.
     */
    readonly save = output<AppListingText>();

    /**
     * Emits when the user dismisses the error from saving the listing.
     */
    readonly dismissSaveError = output<void>();

    /**
     * Emits when the user wants to load the latest version of the listing.
     */
    readonly reload = output<void>();

    private readonly saveButton = viewChild.required<LoadingButton>("saveButton");

    private readonly model = linkedSignal(() => {
        const listing = this.listing();
        return {
            language: this.languages[0],
            name: listing?.name ?? "",
            shortDescription: listing?.shortDescription ?? "",
        };
    });
    protected readonly listingForm = form(
        this.model,
        (path) => {
            // Disable the form only once progress shows so that it doesn't flash on fast saves, but
            // make it read-only immediately to prevent additional edits from being discarded
            readonly(path, {
                when: () => this.saveState() === "pending" || this.reloadState() === "pending",
            });
            disabled(path, {
                when: () => this.saveState() === "loading" || this.reloadState() === "loading",
            });
            required(path.language);
            required(path.name, { message: "Enter the app's name" });
            validate(path.name, maxCodePoints(LISTING_NAME_MAX_LENGTH));
            required(path.shortDescription, { message: "Enter a short description" });
            validate(path.shortDescription, maxCodePoints(LISTING_SHORT_DESCRIPTION_MAX_LENGTH));
        },
        {
            submission: {
                action: (field) => {
                    const { name, shortDescription } = field().value();
                    this.save.emit({ name, shortDescription });
                    return Promise.resolve();
                },
            },
        },
    );

    /**
     * The reason the user can't save the listing, if applicable.
     */
    protected readonly saveDisabledReason = computed(() => {
        if (this.reloadState() !== "idle") {
            return "Reloading listing";
        }

        const listing = this.listing();
        const edited = this.model();
        const unchanged =
            edited.name === listing?.name && edited.shortDescription === listing?.shortDescription;

        return unchanged ? "No changes to save" : undefined;
    });

    protected closeSaveError(): void {
        // Focus the save button when dismissing the error so that focus doesn't fall back to the
        // document when the dismiss button is removed
        this.saveButton().focus();
        this.dismissSaveError.emit();
    }

    protected reloadListing(): void {
        // Focus the save button when reloading so that focus doesn't fall back to the document when
        // the reload button is removed along with the error
        this.saveButton().focus();
        this.reload.emit();
    }

    protected saveErrorMessage(kind: AppListingTextSaveError["kind"]): string {
        switch (kind) {
            case "unauthenticated":
                return UNAUTHENTICATED_MESSAGE;
            case "permissionDenied":
                return "You don't have permission to edit the listing for this app.";
            case "conflict":
                return (
                    "This listing was changed since you opened it, perhaps in another tab or " +
                    "session. Reload it to see the latest version, which will discard your changes " +
                    "here."
                );
            case "unavailable":
                return UNAVAILABLE_MESSAGE;
        }
    }
}

/**
 * Creates a validator which limits a field's length by code point count.
 *
 * The main differences from Angular's built-in `maxLength` rule are that this validator:
 *
 * - counts string length in Unicode code points instead of UTF-16 code units
 * - doesn't set the native `maxlength` property on inputs, allowing them to contain an invalid
 *   number of characters while editing
 *
 * @param n - the maximum number of Unicode code points to allow.
 * @returns the validator.
 */
function maxCodePoints(n: number): FieldValidator<string, PathKind.Child> {
    return ({ value }) =>
        codePointLength(value()) > n
            ? maxLengthError(n, { message: `Use at most ${n} characters` })
            : undefined;
}

/**
 * An error which occurs when saving a listing from a {@link AppListingTextEditor}.
 *
 * - `unauthenticated`: the user isn't logged in.
 * - `permissionDenied`: the user isn't allowed to edit the app draft.
 * - `conflict`: the listing was changed elsewhere since it was loaded.
 * - `unavailable`: saving failed for a reason outside of the user's control.
 */
export interface AppListingTextSaveError {
    readonly kind: "unauthenticated" | "permissionDenied" | "conflict" | "unavailable";

    /**
     * The number of failed attempts in a row to save the listing.
     */
    readonly failedAttempts: number;
}
