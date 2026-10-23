// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, computed, effect, inject, input, resource } from "@angular/core";
import { Router } from "@angular/router";
import type { Result } from "../../../core/result";
import { withDelay } from "../../../domain/delay";
import type { GetOrganizationError } from "../../../domain/ports/console/errors";
import type { GetOrganizationResponse } from "../../../domain/ports/console/get-organization-response";
import { CONSOLE_API } from "../../tokens";
import {
    OrgDashboardPage,
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

    private readonly organization = resource({
        params: () => ({ organizationId: this.orgId() }),
        loader: ({ params, abortSignal }) =>
            withDelay(this.consoleApi.getOrganization(params, abortSignal)),
    });
    protected readonly state = computed((): OrgDashboardPageState => {
        if (this.organization.status() === "error") {
            return { kind: "loadingFailed" };
        }
        return this.organization.hasValue()
            ? toPageState(this.organization.value())
            : { kind: "loading" };
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

function toPageState(
    result: Result<GetOrganizationResponse, GetOrganizationError>,
): OrgDashboardPageState {
    if (result.ok) {
        return { kind: "loaded", organization: result.value.organization };
    }

    switch (result.error.kind) {
        case "permissionDenied":
            return { kind: "permissionDenied" };
        // Keep showing progress while redirecting to the login page
        case "unauthenticated":
            return { kind: "loading" };
        default:
            return { kind: "loadingFailed" };
    }
}
