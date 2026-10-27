// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Request defining parameters for creating an app draft.
 */
export interface CreateAppDraftRequest {
    /**
     * The ID of the organization to create the app draft under.
     */
    readonly organizationId: string;
}
