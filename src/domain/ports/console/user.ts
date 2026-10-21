// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * A console user.
 */
export interface User {
    /**
     * The user's unique ID.
     */
    readonly id: string;

    /**
     * The user's roles.
     */
    readonly roles: ReadonlySet<UserRole>;
}

/**
 * A user authorization role.
 *
 * - `reviewer`: an app reviewer.
 * - `publisher`: an app publisher.
 */
export type UserRole = "reviewer" | "publisher";
