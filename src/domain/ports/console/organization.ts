// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * An organization of users.
 */
export interface Organization {
    /**
     * The organization's unique ID.
     */
    readonly id: string;

    /**
     * The maximum number of published apps allowed to exist under this organization.
     */
    readonly publishedAppLimit: number;

    /**
     * The current number of published apps in this organization.
     */
    readonly publishedAppCount: number;

    /**
     * The maximum number of active app drafts allowed to exist under this organization.
     */
    readonly activeAppDraftLimit: number;

    /**
     * The current number of active app drafts in this organization.
     */
    readonly activeAppDraftCount: number;
}
