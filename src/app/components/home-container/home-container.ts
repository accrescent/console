// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject, PendingTasks, signal } from "@angular/core";
import { Router } from "@angular/router";
import { CONSOLE_API } from "../../tokens";
import { HomePage, HomePageState } from "../home-page/home-page";

/**
 * The minimum number of milliseconds to show the progress indicator when reloading so that the user
 * can see it even when reloading occurs quickly.
 */
const MIN_RELOAD_DURATION_MS = 500;

/**
 * Effectful container for the home page which redirects the user to the dashboard if they're
 * authenticated or the login page if they aren't.
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
        this.redirect(MIN_RELOAD_DURATION_MS);
    }

    /**
     * Determines where to send the user and redirects them there, displaying an error on failure.
     *
     * @param minDurationMs - the minimum number of milliseconds to wait before redirecting or
     * showing an error.
     */
    private redirect(minDurationMs = 0): void {
        // Run as a pending task so that the app isn't considered stable until we've redirected or
        // displayed an error
        this.pendingTasks.run(() => this.tryRedirect(minDurationMs));
    }

    private async tryRedirect(minDurationMs: number): Promise<void> {
        const [result] = await Promise.all([
            this.consoleApi.getSelf(),
            new Promise((resolve) => setTimeout(resolve, minDurationMs)),
        ]);

        if (result.ok) {
            await this.router.navigate(["/dashboard"], { replaceUrl: true });
        } else if (result.error.kind === "unauthenticated") {
            await this.router.navigate(["/login"], { replaceUrl: true });
        } else {
            this.state.set(HomePageState.LoadingFailed);
        }
    }
}
