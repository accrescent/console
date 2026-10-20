// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { InjectionToken } from "@angular/core";
import type { AuthnApi } from "../domain/ports/authn/authn-api";

/**
 * Injection token for the {@link AuthnApi} port.
 */
export const AUTHN_API = new InjectionToken<AuthnApi>("AuthnApi");
