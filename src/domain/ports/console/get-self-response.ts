// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { User } from "./user";

/**
 * Response to getting the currently authenticated user.
 */
export interface GetSelfResponse {
    /**
     * The currently authenticated user.
     */
    readonly user: User;
}
