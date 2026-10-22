// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { Result } from "../../../core/result";
import type { LogOutError } from "./errors";

/**
 * The Accrescent console's authentication API.
 */
export interface AuthnApi {
    /**
     * Starts the GitHub login flow.
     *
     * This method may navigate away from the app, so callers shouldn't rely on doing anything after
     * it returns.
     */
    logInWithGitHub(): void;

    /**
     * Logs out the currently authenticated user, invalidating their session.
     */
    logOut(): Promise<Result<void, LogOutError>>;
}
