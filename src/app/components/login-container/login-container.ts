// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject, signal } from "@angular/core";
import { AUTHN_API } from "../../tokens";
import { LoginPage } from "../login-page/login-page";

/**
 * Effectful container for the login page.
 */
@Component({
    host: { "(window:pageshow)": "handlePageShow($event)" },
    imports: [LoginPage],
    selector: "acc-login-container",
    templateUrl: "./login-container.html",
})
export class LoginContainer {
    private readonly authnApi = inject(AUTHN_API);

    /**
     * Whether the GitHub login flow has started.
     */
    protected readonly loggingIn = signal(false);

    /**
     * Starts the GitHub login flow.
     */
    protected login(): void {
        this.loggingIn.set(true);
        this.authnApi.logInWithGitHub();
    }

    /**
     * Resets the login state when the page is restored from the back/forward cache (e.g., when the
     * user navigates back from GitHub) so that the login button isn't stuck loading. See
     * https://web.dev/articles/bfcache#update-data-after-restore for more info on this practice.
     */
    protected handlePageShow(event: PageTransitionEvent): void {
        if (event.persisted) {
            this.loggingIn.set(false);
        }
    }
}
