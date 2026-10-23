// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { Organization } from "./organization";

/**
 * Response to getting an organization.
 */
export interface GetOrganizationResponse {
    /**
     * The requested organization.
     */
    readonly organization: Organization;
}
