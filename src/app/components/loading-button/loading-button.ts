// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, computed, input, output, viewChild } from "@angular/core";
import { MatButton, type MatButtonAppearance } from "@angular/material/button";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTooltip } from "@angular/material/tooltip";

/**
 * A Material button which shows progress once activated.
 *
 * `mat-icon` elements and content with the `matButtonIcon` attribute are shown in the button's icon
 * slot
 *
 * @example
 * ```html
 * <acc-loading-button
 *     appearance="filled"
 *     [state]="state"
 *     loadingLabel="Loading"
 *     (press)="load.emit()">
 *     Load
 * </acc-loading-button>
 * ```
 */
@Component({
    imports: [MatButton, MatProgressSpinner, MatTooltip],
    selector: "acc-loading-button",
    templateUrl: "./loading-button.html",
    host: { class: "inline-flex" },
})
export class LoadingButton {
    /**
     * The appearance of the button.
     */
    readonly appearance = input<MatButtonAppearance>("text");

    /**
     * The state of the action the button starts.
     */
    readonly state = input.required<LoadingButtonState>();

    /**
     * The accessible name of the button while loading, describing the action in progress.
     */
    readonly loadingLabel = input.required<string>();

    /**
     * The reason the button is disabled. When set, the button is disabled and displays the reason
     * in a tooltip on hover.
     */
    readonly disabledReason = input<string>();

    /**
     * Emits when the user clicks the button while the action isn't in progress.
     */
    readonly press = output<void>();

    private readonly button = viewChild.required(MatButton);

    protected readonly disabled = computed(
        () => this.state() !== "idle" || this.disabledReason() !== undefined,
    );
    protected readonly loading = computed(() => this.state() === "loading");

    /**
     * Focuses the button.
     */
    focus(): void {
        this.button().focus();
    }
}

/**
 * The state of the action a {@link LoadingButton} starts.
 *
 * - `idle`: the action hasn't been started.
 * - `pending`: the action has started but isn't yet showing progress.
 * - `loading`: the action has been started and is actively showing progress.
 */
export type LoadingButtonState = "idle" | "pending" | "loading";
