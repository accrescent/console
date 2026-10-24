// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input } from "@angular/core";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import {
    type ConsoleResource,
    type FullPageErrorUnavailable,
    FullPageErrorView,
} from "../full-page-error-view/full-page-error-view";

/**
 * The page shown while determining where to send the user on entering the console.
 */
@Component({
    imports: [FullPageErrorView, MatProgressSpinner],
    selector: "acc-home-page",
    templateUrl: "./home-page.html",
})
export class HomePage {
    /**
     * The state of determining where to send the user.
     */
    readonly state = input.required<HomePageState>();
}

/**
 * The state of the {@link HomePage}.
 */
export type HomePageState = HomePageLoading | HomePageError;

/**
 * Determining where to send the user is in progress.
 */
export interface HomePageLoading {
    readonly kind: "loading";
}

/**
 * Determining where to send the user failed.
 */
export interface HomePageError {
    readonly kind: "error";

    /**
     * The error that occurred.
     */
    readonly error: FullPageErrorUnavailable<ConsoleResource>;
}
