// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, computed, effect, inject, input, resource, signal } from "@angular/core";
import { Router } from "@angular/router";
import type { Result } from "../../../core/result";
import { withDeferredProgress } from "../../../domain/delay";
import type { GetOrganizationError } from "../../../domain/ports/console/errors";
import type { GetOrganizationResponse } from "../../../domain/ports/console/get-organization-response";
import { CONSOLE_API } from "../../tokens";
import type { OrganizationResource } from "../full-page-error-view/full-page-error-view";
import {
    OrgDashboardPage,
    type OrgDashboardPageLoading,
    type OrgDashboardPagePending,
    type OrgDashboardPageState,
} from "../org-dashboard-page/org-dashboard-page";

/**
 * Effectful container for the organization dashboard page which loads the organization to show.
 */
@Component({
    imports: [OrgDashboardPage],
    selector: "acc-org-dashboard-container",
    host: { class: "block h-full" },
    templateUrl: "./org-dashboard-container.html",
})
export class OrgDashboardContainer {
    private readonly consoleApi = inject(CONSOLE_API);
    private readonly router = inject(Router);

    /**
     * The ID of the organization to show the dashboard for.
     */
    readonly orgId = input.required<string>();

    /**
     * Whether loading the organization has taken long enough to show progress.
     */
    private readonly showProgress = signal(false);

    private readonly organization = resource({
        params: () => ({ organizationId: this.orgId() }),
        loader: ({ params, abortSignal }) => {
            this.showProgress.set(false);
            return withDeferredProgress(this.consoleApi.getOrganization(params, abortSignal), () =>
                this.showProgress.set(true),
            );
        },
    });
    protected readonly state = computed((): OrgDashboardPageState => {
        const resource: OrganizationResource = { kind: "organization", id: this.orgId() };
        const progress: ProgressState = this.showProgress()
            ? { kind: "loading" }
            : { kind: "pending" };
        if (this.organization.status() === "error") {
            return { kind: "error", error: { kind: "unavailable", resource } };
        }
        return this.organization.hasValue()
            ? toPageState(this.organization.value(), resource, progress)
            : progress;
    });

    constructor() {
        // Redirect the user to the login page if authentication fails
        effect(() => {
            if (!this.organization.hasValue()) {
                return;
            }
            const result = this.organization.value();
            if (!result.ok && result.error.kind === "unauthenticated") {
                this.router.navigate(["/login"], { replaceUrl: true });
            }
        });
    }
}

type ProgressState = OrgDashboardPagePending | OrgDashboardPageLoading;

function toPageState(
    result: Result<GetOrganizationResponse, GetOrganizationError>,
    resource: OrganizationResource,
    progress: ProgressState,
): OrgDashboardPageState {
    if (result.ok) {
        return { kind: "loaded", organization: result.value.organization };
    }

    switch (result.error.kind) {
        // Keep showing the same progress state while redirecting to the login page
        case "unauthenticated":
            return progress;
        case "permissionDenied":
            return { kind: "error", error: { kind: "permissionDenied", resource } };
        case "internal":
        case "serviceUnavailable":
        case "unknown":
            return { kind: "error", error: { kind: "unavailable", resource } };
    }
}
