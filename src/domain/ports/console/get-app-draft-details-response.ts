// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { AppDraftListingText } from "./app-draft-listing-text";

/**
 * Response to getting an app draft's details.
 */
export interface GetAppDraftDetailsResponse {
    /**
     * The app draft's listing text, if it has been created.
     */
    readonly listingText?: AppDraftListingText;
}
