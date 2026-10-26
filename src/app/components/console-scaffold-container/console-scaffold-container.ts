// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Component, inject, PendingTasks, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
    MatSnackBar,
    type MatSnackBarRef,
    type TextOnlySnackBar,
} from "@angular/material/snack-bar";
import { Router, RouterOutlet } from "@angular/router";
import { map } from "rxjs";
import { withDeferredProgress } from "../../../domain/delay";
import { AUTHN_API } from "../../tokens";
import { ConsoleScaffoldPage } from "../console-scaffold-page/console-scaffold-page";
import type { LoadingButtonState } from "../loading-button/loading-button";

/**
 * Effectful container for the console scaffold which renders child routes inside the scaffold.
 */
@Component({
    imports: [ConsoleScaffoldPage, RouterOutlet],
    selector: "acc-console-scaffold-container",
    templateUrl: "./console-scaffold-container.html",
})
export class ConsoleScaffoldContainer {
    private readonly authnApi = inject(AUTHN_API);
    private readonly pendingTasks = inject(PendingTasks);
    private readonly router = inject(Router);
    private readonly snackBar = inject(MatSnackBar);

    /**
     * Whether the screen is handset-sized.
     */
    protected readonly handset = toSignal(
        inject(BreakpointObserver)
            .observe(Breakpoints.Handset)
            .pipe(map((result) => result.matches)),
        { initialValue: false },
    );

    /**
     * The state of logging out.
     */
    protected readonly logoutState = signal<LoadingButtonState>("idle");

    /**
     * The snackbar showing the last logout error, if any.
     */
    private logOutErrorRef?: MatSnackBarRef<TextOnlySnackBar>;

    /**
     * Logs the user out and sends them to the login page, displaying an error on failure.
     */
    protected logOut(): void {
        this.logOutErrorRef?.dismiss();
        this.logoutState.set("pending");
        // Run as a pending task so that the app isn't considered stable until we've redirected or
        // displayed an error
        this.pendingTasks.run(() => this.tryLogOut());
    }

    private async tryLogOut(): Promise<void> {
        const result = await withDeferredProgress(this.authnApi.logOut(), () =>
            this.logoutState.set("loading"),
        );

        // Treat "unauthenticated" as success since the user is already logged out
        if (result.ok || result.error.kind === "unauthenticated") {
            await this.router.navigate(["/login"], { replaceUrl: true });
        } else {
            this.logOutErrorRef = this.snackBar.open(
                "Couldn't log out. You're still logged in.",
                "Dismiss",
            );
        }

        // Reset even after navigation since it could have been cancelled
        this.logoutState.set("idle");
    }
}
