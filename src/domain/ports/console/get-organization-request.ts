// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Request defining parameters for getting an organization.
 */
export interface GetOrganizationRequest {
    /**
     * The ID of the organization to retrieve.
     */
    readonly organizationId: string;
}
