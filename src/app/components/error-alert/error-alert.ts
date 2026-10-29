// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Component, effect, inject, input, output } from "@angular/core";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";

/**
 * An accessible, reusable visual alert which indicates an error occurred.
 *
 * This component re-announces its content whenever its inputs change so that whenever an operation
 * is retried and results in the same error (and `failedAttempts` is incremented by the parent
 * component), accessibility services can distinguish subsequent errors from the original.
 *
 * @example
 * ```html
 * <acc-error-alert
 *     heading="Could not create the document"
 *     message="You do not have sufficient permissions to create a document."
 *     [failedAttempts]="failedAttempts"
 *     [dismissible]="true"
 *     (dismiss)="dismissError.emit()" />
 * ```
 */
@Component({
    imports: [MatIcon, MatIconButton],
    selector: "acc-error-alert",
    templateUrl: "./error-alert.html",
    host: { class: "block" },
})
export class ErrorAlert {
    private readonly liveAnnouncer = inject(LiveAnnouncer);

    /**
     * A short summary of the error.
     */
    readonly heading = input.required<string>();

    /**
     * A message explaining the error and what the user can do about it.
     */
    readonly message = input.required<string>();

    /**
     * The number of failed attempts in a row to perform the operation.
     */
    readonly failedAttempts = input.required<number>();

    /**
     * Whether to show a button which lets the user dismiss the alert.
     */
    readonly dismissible = input.required<boolean>();

    /**
     * Emits when the user clicks the dismiss button.
     */
    readonly dismiss = output<void>();

    constructor() {
        effect(() => {
            const failedAttempts = this.failedAttempts();
            const attemptsSuffix = failedAttempts > 1 ? ` Failed attempts: ${failedAttempts}.` : "";
            this.liveAnnouncer.announce(
                `${this.heading()}. ${this.message()}${attemptsSuffix}`,
                "assertive",
            );
        });
    }
}
