// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject, PendingTasks, signal } from "@angular/core";
import { Router } from "@angular/router";
import { withDelay } from "../../../domain/delay";
import { CONSOLE_API } from "../../tokens";
import { HomePage, HomePageState } from "../home-page/home-page";

/**
 * Effectful container for the home page which redirects the user to their organization's dashboard
 * if they're authenticated or the login page if they aren't.
 */
@Component({
    imports: [HomePage],
    selector: "acc-home-container",
    templateUrl: "./home-container.html",
})
export class HomeContainer {
    private readonly consoleApi = inject(CONSOLE_API);
    private readonly router = inject(Router);
    private readonly pendingTasks = inject(PendingTasks);

    protected readonly state = signal(HomePageState.Loading);

    constructor() {
        this.redirect();
    }

    /**
     * Reloads the page, trying to determine where to redirect to after previously failing to do so.
     */
    protected reload(): void {
        this.state.set(HomePageState.Reloading);
        this.redirect();
    }

    /**
     * Determines where to send the user and redirects them there, displaying an error on failure.
     */
    private redirect(): void {
        // Run as a pending task so that the app isn't considered stable until we've redirected or
        // displayed an error
        this.pendingTasks.run(() => this.tryRedirect());
    }

    private async tryRedirect(): Promise<void> {
        const result = await withDelay(this.consoleApi.getMyOrganization());

        if (result.ok) {
            await this.router.navigate(["/orgs", result.value.organizationId, "dashboard"], {
                replaceUrl: true,
            });
        } else if (result.error.kind === "unauthenticated") {
            await this.router.navigate(["/login"], { replaceUrl: true });
        } else {
            this.state.set(HomePageState.LoadingFailed);
        }
    }
}
