// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Request defining parameters for creating an app draft's listing text.
 */
export interface CreateAppDraftListingTextRequest {
    /**
     * The ID of the app draft to create the listing text for.
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
}
