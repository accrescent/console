// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input, output } from "@angular/core";
import { MatButton, type MatButtonAppearance } from "@angular/material/button";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

/**
 * A Material button which shows progress once activated.
 *
 * @example
 * ```html
 * <acc-loading-button
 *     appearance="filled"
 *     [loading]="loading"
 *     loadingLabel="Loading"
 *     (press)="load.emit()">
 *     Load
 * </acc-loading-button>
 * ```
 */
@Component({
    imports: [MatButton, MatProgressSpinner],
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
     * Whether the action the button starts is in progress.
     */
    readonly loading = input.required<boolean>();

    /**
     * The accessible name of the button while loading, describing the action in progress.
     */
    readonly loadingLabel = input.required<string>();

    /**
     * Emits when the user clicks the button while not loading.
     */
    readonly press = output<void>();
}
