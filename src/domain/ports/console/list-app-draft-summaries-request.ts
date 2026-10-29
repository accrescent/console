// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Request defining parameters for listing app draft summaries.
 */
export interface ListAppDraftSummariesRequest {
    /**
     * The ID of the organization containing the app drafts to list.
     */
    readonly organizationId: string;
}
