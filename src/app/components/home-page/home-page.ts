// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input } from "@angular/core";

import type {
    ConsoleResource,
    FullPageErrorUnavailable,
} from "../full-page-error-view/full-page-error-view";
import { LoadablePage, type PageState } from "../loadable-page/loadable-page";

/**
 * The page shown while determining where to send the user on entering the console.
 */
@Component({
    imports: [LoadablePage],
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
export type HomePageState = PageState<never, FullPageErrorUnavailable<ConsoleResource>>;
