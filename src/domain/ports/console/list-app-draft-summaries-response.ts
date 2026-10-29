// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { AppDraftSummary } from "./app-draft-summary";

/**
 * Response to listing app draft summaries.
 */
export interface ListAppDraftSummariesResponse {
    /**
     * The organization's app draft summaries, ordered from newest to oldest.
     */
    readonly appDraftSummaries: readonly AppDraftSummary[];
}
