// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * The text fields of an app draft listing.
 */
export interface AppDraftListingText {
    /**
     * The proper name of the app.
     */
    readonly name: string;

    /**
     * A short description of the app.
     */
    readonly shortDescription: string;

    /**
     * The etag of the listing text.
     */
    readonly etag: string;
}
