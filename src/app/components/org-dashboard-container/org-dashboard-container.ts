// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import {
    Component,
    computed,
    effect,
    inject,
    input,
    PendingTasks,
    resource,
    signal,
} from "@angular/core";
import { Router } from "@angular/router";
import type { Result } from "../../../core/result";
import { withDeferredProgress } from "../../../domain/delay";
import type {
    CreateAppDraftError,
    GetOrganizationError,
    ListAppDraftSummariesError,
} from "../../../domain/ports/console/errors";
import type { GetOrganizationResponse } from "../../../domain/ports/console/get-organization-response";
import type { ListAppDraftSummariesResponse } from "../../../domain/ports/console/list-app-draft-summaries-response";
import { CONSOLE_API } from "../../tokens";
import type { OrganizationResource } from "../full-page-error-view/full-page-error-view";
import type { LoadingButtonState } from "../loading-button/loading-button";
import {
    type OrgDashboardAppDrafts,
    type OrgDashboardCreateAppDraftError,
    OrgDashboardPage,
    type OrgDashboardPageLoaded,
    type OrgDashboardPageLoading,
    type OrgDashboardPagePending,
    type OrgDashboardPageState,
} from "../org-dashboard-page/org-dashboard-page";

/**
 * Effectful container for the organization dashboard page which loads the dashboard's info and
 * creates app drafts.
 */
@Component({
    imports: [OrgDashboardPage],
    selector: "acc-org-dashboard-container",
    host: { class: "block h-full" },
    templateUrl: "./org-dashboard-container.html",
})
export class OrgDashboardContainer {
    private readonly consoleApi = inject(CONSOLE_API);
    private readonly pendingTasks = inject(PendingTasks);
    private readonly router = inject(Router);

    /**
     * The ID of the organization to show the dashboard for.
     */
    readonly orgId = input.required<string>();

    /**
     * Whether loading the dashboard has taken long enough to show progress.
     */
    private readonly showProgress = signal(false);

    private readonly dashboard = resource({
        params: () => ({ organizationId: this.orgId() }),
        loader: ({ params, abortSignal }) => {
            this.showProgress.set(false);
            const results = Promise.all([
                this.consoleApi.getOrganization(params, abortSignal),
                this.consoleApi.listAppDraftSummaries(params, abortSignal),
            ]);
            return withDeferredProgress(results, () => this.showProgress.set(true));
        },
    });
    protected readonly state = computed((): OrgDashboardPageState => {
        const resource: OrganizationResource = { kind: "organization", id: this.orgId() };
        const progress: ProgressState = this.showProgress()
            ? { kind: "loading" }
            : { kind: "pending" };
        if (this.dashboard.status() === "error") {
            return { kind: "error", error: { kind: "unavailable", resource } };
        }
        const createAppDraft = {
            createAppDraftState: this.createAppDraftState(),
            createAppDraftError: this.createAppDraftError(),
        };
        return this.dashboard.hasValue()
            ? toPageState(this.dashboard.value(), createAppDraft, resource, progress)
            : progress;
    });

    /**
     * The state of creating an app draft.
     */
    private readonly createAppDraftState = signal<LoadingButtonState>("idle");

    /**
     * The error from the last attempt to create an app draft, if applicable.
     */
    private readonly createAppDraftError = signal<OrgDashboardCreateAppDraftError | undefined>(
        undefined,
    );

    constructor() {
        // Redirect the user to the login page if authentication fails
        effect(() => {
            if (this.dashboard.hasValue() && this.dashboard.value().some(isUnauthenticated)) {
                this.router.navigate(["/login"], { replaceUrl: true });
            }
        });
    }

    /**
     * Creates an app draft and opens it in the app draft editor, displaying an error on failure.
     */
    protected createAppDraft(): void {
        this.createAppDraftState.set("pending");
        // Run as a pending task so that the app isn't considered stable until we've navigated or
        // displayed an error
        this.pendingTasks.run(() => this.tryCreateAppDraft());
    }

    private async tryCreateAppDraft(): Promise<void> {
        const orgId = this.orgId();
        const result = await withDeferredProgress(
            this.consoleApi.createAppDraft({ organizationId: orgId }),
            () => this.createAppDraftState.set("loading"),
        );

        if (result.ok) {
            this.createAppDraftError.set(undefined);
            await this.router.navigate(["/orgs", orgId, "appDrafts", result.value.appDraftId]);
        } else if (result.error.kind === "unauthenticated") {
            this.createAppDraftError.set(undefined);
            await this.router.navigate(["/login"], { replaceUrl: true });
        } else {
            const failedAttempts = (this.createAppDraftError()?.failedAttempts ?? 0) + 1;
            this.createAppDraftError.set(toPageError(result.error, failedAttempts));
        }

        // Reset even after navigation since it could have been cancelled
        this.createAppDraftState.set("idle");
    }

    protected dismissCreateAppDraftError(): void {
        this.createAppDraftError.set(undefined);
    }
}

function toPageError(
    error: Exclude<CreateAppDraftError, { kind: "unauthenticated" }>,
    failedAttempts: number,
): OrgDashboardCreateAppDraftError {
    switch (error.kind) {
        case "permissionDenied":
        case "resourceLimitExceeded":
            return { kind: error.kind, failedAttempts };
        case "internal":
        case "serviceUnavailable":
        case "unknown":
            return { kind: "unavailable", failedAttempts };
    }
}

type ProgressState = OrgDashboardPagePending | OrgDashboardPageLoading;

type DashboardResults = readonly [
    Result<GetOrganizationResponse, GetOrganizationError>,
    Result<ListAppDraftSummariesResponse, ListAppDraftSummariesError>,
];

function isUnauthenticated(result: DashboardResults[number]): boolean {
    return !result.ok && result.error.kind === "unauthenticated";
}

function toPageState(
    results: DashboardResults,
    createAppDraft: Pick<OrgDashboardPageLoaded, "createAppDraftState" | "createAppDraftError">,
    resource: OrganizationResource,
    progress: ProgressState,
): OrgDashboardPageState {
    // Keep showing the same progress state while redirecting to the login page
    if (results.some(isUnauthenticated)) {
        return progress;
    }

    const [organizationResult, appDraftsResult] = results;
    if (organizationResult.ok) {
        return {
            kind: "loaded",
            organization: organizationResult.value.organization,
            appDrafts: toAppDrafts(appDraftsResult),
            ...createAppDraft,
        };
    }

    switch (organizationResult.error.kind) {
        case "permissionDenied":
            return { kind: "error", error: { kind: "permissionDenied", resource } };
        // Never shown for unauthenticated since we show progress while redirecting to the login page
        case "unauthenticated":
        case "internal":
        case "serviceUnavailable":
        case "unknown":
            return { kind: "error", error: { kind: "unavailable", resource } };
    }
}

function toAppDrafts(
    result: Result<ListAppDraftSummariesResponse, ListAppDraftSummariesError>,
): OrgDashboardAppDrafts {
    if (result.ok) {
        return { kind: "loaded", summaries: result.value.appDraftSummaries };
    }

    switch (result.error.kind) {
        case "permissionDenied":
            return { kind: "error", error: { kind: "permissionDenied" } };
        // Never shown since toPageState shows progress while redirecting to the login page
        case "unauthenticated":
        case "internal":
        case "serviceUnavailable":
        case "unknown":
            return { kind: "error", error: { kind: "unavailable" } };
    }
}
