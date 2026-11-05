// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input } from "@angular/core";

import type {
    FullPageErrorPermissionDenied,
    FullPageErrorUnavailable,
    OrganizationResource,
} from "../full-page-error-view/full-page-error-view";
import { LoadablePage, type PageState } from "../loadable-page/loadable-page";
import {
    OrgDashboardContent,
    type OrgDashboardContentState,
    OrgDashboardOutputs,
} from "../org-dashboard-content/org-dashboard-content";

/**
 * The dashboard page for a given organization.
 */
@Component({
    imports: [LoadablePage, OrgDashboardContent],
    selector: "acc-org-dashboard-page",
    templateUrl: "./org-dashboard-page.html",
})
export class OrgDashboardPage extends OrgDashboardOutputs {
    /**
     * The UI state of the organization dashboard page.
     */
    readonly state = input.required<OrgDashboardPageState>();
}

/**
 * The state of an {@link OrgDashboardPage}.
 */
export type OrgDashboardPageState = PageState<OrgDashboardContentState, OrgDashboardLoadError>;

/**
 * An error which prevents an {@link OrgDashboardPage} from loading.
 */
type OrgDashboardLoadError =
    | FullPageErrorUnavailable<OrganizationResource>
    | FullPageErrorPermissionDenied<OrganizationResource>;
