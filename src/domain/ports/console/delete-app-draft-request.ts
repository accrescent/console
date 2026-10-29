// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Request defining parameters for deleting an app draft.
 */
export interface DeleteAppDraftRequest {
    /**
     * The ID of the app draft to delete.
     */
    readonly appDraftId: string;
}
