// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Response to getting the organization owned by the currently authenticated user.
 */
export interface GetMyOrganizationResponse {
    /**
     * The ID of the organization owned by the currently authenticated user.
     */
    readonly organizationId: string;
}
