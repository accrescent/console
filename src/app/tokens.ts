// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { InjectionToken } from "@angular/core";
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
