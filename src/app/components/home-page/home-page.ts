// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input, output } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

/**
 * The state of the {@link HomePage}.
 */
export enum HomePageState {
    /**
     * Determining where to send the user is in progress.
     */
    Loading,

    /**
     * Determining where to send the user failed.
     */
    LoadingFailed,

    /**
     * Determining where to send the user after a previous attempt failed.
     */
    Reloading,
}

/**
 * The page shown while determining where to send the user on entering the console.
 */
@Component({
    imports: [MatButton, MatProgressSpinner],
    selector: "acc-home-page",
    templateUrl: "./home-page.html",
})
export class HomePage {
    protected readonly HomePageState = HomePageState;

    /**
     * The state of determining where to send the user.
     */
    readonly state = input.required<HomePageState>();

    /**
     * Emits when the user clicks the reload button.
     */
    readonly reload = output<void>();
}
