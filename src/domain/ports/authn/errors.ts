// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used by {@link} in TSDoc
import type { AuthnApi } from "./authn-api";

/**
 * An error returned by {@link AuthnApi.logOut}.
 */
export type LogOutError = UnauthenticatedError | UnknownError;

/**
 * An error indicating the user isn't authenticated.
 */
export interface UnauthenticatedError {
    readonly kind: "unauthenticated";
}

/**
 * An unknown error.
 */
export interface UnknownError {
    readonly kind: "unknown";
}
