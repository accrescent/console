// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input, output } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { RouterLink } from "@angular/router";
import type { Organization } from "../../../domain/ports/console/organization";
import { LoadingButton } from "../loading-button/loading-button";
import { QuotaCard } from "../quota-card/quota-card";

/**
 * The dashboard page for a given organization.
 */
@Component({
    imports: [LoadingButton, MatButton, MatIcon, MatProgressSpinner, QuotaCard, RouterLink],
    selector: "acc-org-dashboard-page",
    templateUrl: "./org-dashboard-page.html",
})
export class OrgDashboardPage {
    /**
     * The UI state of the organization dashboard page.
     */
    readonly state = input.required<OrgDashboardPageState>();

    /**
     * Emits when the user clicks the reload button.
     */
    readonly reload = output<void>();
}

/**
 * The state of an {@link OrgDashboardPage}.
 */
export type OrgDashboardPageState =
    | OrgDashboardPageLoading
    | OrgDashboardPageLoadingFailed
    | OrgDashboardPageReloading
    | OrgDashboardPagePermissionDenied
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
export interface OrgDashboardPageLoadingFailed {
    readonly kind: "loadingFailed";
}

/**
 * Loading the organization is in progress after a previous attempt failed.
 */
export interface OrgDashboardPageReloading {
    readonly kind: "reloading";
}

/**
 * The user isn't allowed to view the organization.
 */
export interface OrgDashboardPagePermissionDenied {
    readonly kind: "permissionDenied";
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
