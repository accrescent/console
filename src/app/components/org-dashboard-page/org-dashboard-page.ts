// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input } from "@angular/core";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import type { Organization } from "../../../domain/ports/console/organization";
import {
    type FullPageErrorPermissionDenied,
    type FullPageErrorUnavailable,
    FullPageErrorView,
    type OrganizationResource,
} from "../full-page-error-view/full-page-error-view";
import { QuotaCard } from "../quota-card/quota-card";

/**
 * The dashboard page for a given organization.
 */
@Component({
    imports: [FullPageErrorView, MatProgressSpinner, QuotaCard],
    selector: "acc-org-dashboard-page",
    templateUrl: "./org-dashboard-page.html",
})
export class OrgDashboardPage {
    /**
     * The UI state of the organization dashboard page.
     */
    readonly state = input.required<OrgDashboardPageState>();
}

/**
 * The state of an {@link OrgDashboardPage}.
 */
export type OrgDashboardPageState =
    | OrgDashboardPageLoading
    | OrgDashboardPageError
    | OrgDashboardPageLoaded;

/**
 * Loading the organization is in progress.
 */
export interface OrgDashboardPageLoading {
    readonly kind: "loading";
}

/**
 * Loading the organization failed.
 */
export interface OrgDashboardPageError {
    readonly kind: "error";

    /**
     * The error that occurred.
     */
    readonly error: FullPageErrorUnavailable<OrganizationResource> | FullPageErrorPermissionDenied;
}

/**
 * The organization loaded successfully.
 */
export interface OrgDashboardPageLoaded {
    readonly kind: "loaded";

    /**
     * The organization to show.
     */
    readonly organization: Organization;
}
