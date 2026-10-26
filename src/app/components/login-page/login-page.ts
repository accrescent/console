// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input, output } from "@angular/core";

import accrescentLogo from "../../../assets/accrescent-logo.svg";
import githubInvertocat from "../../../assets/github-invertocat-white.svg";
import { LoadingButton } from "../loading-button/loading-button";

/**
 * The console login page.
 */
@Component({
    imports: [LoadingButton],
    selector: "acc-login-page",
    templateUrl: "./login-page.html",
})
export class LoginPage {
    protected readonly accrescentLogo = accrescentLogo;
    protected readonly githubInvertocat = githubInvertocat;

    /**
     * Whether login is in progress. While loading, the login button shows a progress indicator and
     * doesn't emit {@link login} events.
     */
    readonly loading = input(false);

    /**
     * Emits when the user clicks the login button.
     */
    readonly login = output<void>();
}
