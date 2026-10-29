// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { inject, InjectionToken, type Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

import type { AuthnApi } from "../domain/ports/authn/authn-api";
import type { ConsoleApi } from "../domain/ports/console/console-api";

/**
 * Injection token for the {@link AuthnApi} port.
 */
export const AUTHN_API = new InjectionToken<AuthnApi>("AuthnApi");

/**
 * Injection token for the {@link ConsoleApi} port.
 */
export const CONSOLE_API = new InjectionToken<ConsoleApi>("ConsoleApi");

/**
 * Injection token for whether the screen is handset-sized.
 */
export const HANDSET = new InjectionToken<Signal<boolean>>("Handset", {
    providedIn: "root",
    factory: (): Signal<boolean> =>
        toSignal(
            inject(BreakpointObserver)
                .observe(Breakpoints.Handset)
                .pipe(map((result) => result.matches)),
            { initialValue: false },
        ),
});
