// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Request defining parameters for updating an app draft's listing text.
 */
export interface UpdateAppDraftListingTextRequest {
    /**
     * The ID of the app draft to update the listing text of.
     */
    readonly appDraftId: string;

    /**
     * The proper name of the app.
     */
    readonly name: string;

    /**
     * A short description of the app.
     */
    readonly shortDescription: string;

    /**
     * The etag of the listing text as last seen by the client.
     */
    readonly etag: string;
}
