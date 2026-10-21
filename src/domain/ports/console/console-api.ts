// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { Result } from "../../../core/result";
import type { GetSelfError } from "./errors";
import type { GetSelfResponse } from "./get-self-response";

/**
 * The Accrescent console API.
 */
export interface ConsoleApi {
    /**
     * Gets the currently authenticated user.
     *
     * @returns a response containing the currently authenticated user.
     */
    getSelf(): Promise<Result<GetSelfResponse, GetSelfError>>;
}
