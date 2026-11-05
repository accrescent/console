// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Request defining parameters for getting an app draft's details.
 */
export interface GetAppDraftDetailsRequest {
    /**
     * The ID of the app draft to get the details of.
     */
    readonly appDraftId: string;
}
