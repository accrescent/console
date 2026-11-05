// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, Directive, input, output, viewChild } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { RouterLink } from "@angular/router";

import { UNAUTHENTICATED_MESSAGE, UNAVAILABLE_MESSAGE } from "../../../domain/error-messages";
import type { AppDraftSummary } from "../../../domain/ports/console/app-draft-summary";
import type { Organization } from "../../../domain/ports/console/organization";
import { quotaLevel } from "../../../domain/quota";
import { AppDraftList } from "../app-draft-list/app-draft-list";
import { ErrorAlert } from "../error-alert/error-alert";
import { LoadingButton, type LoadingButtonState } from "../loading-button/loading-button";
import { QuotaCard } from "../quota-card/quota-card";

const APP_DRAFTS_FULL_ACTION = "Delete or publish an app draft to create another one.";

/**
 * The outputs shared by an {@link OrgDashboardContent} and the page which forwards them.
 */
@Directive()
export abstract class OrgDashboardOutputs {
    /**
     * Emits when the user clicks the new app button.
     */
    readonly createAppDraft = output<void>();

    /**
     * Emits when the user dismisses the error from creating an app draft.
     */
    readonly dismissCreateAppDraftError = output<void>();
}

/**
 * The content of the dashboard page for an organization which has loaded.
 */
@Component({
    imports: [AppDraftList, ErrorAlert, LoadingButton, MatButton, MatIcon, QuotaCard, RouterLink],
    selector: "acc-org-dashboard-content",
    templateUrl: "./org-dashboard-content.html",
})
export class OrgDashboardContent extends OrgDashboardOutputs {
    /**
     * The UI state of the organization dashboard.
     */
    readonly state = input.required<OrgDashboardContentState>();

    private readonly newAppButton = viewChild.required(LoadingButton);

    protected readonly appDraftsFullAction = APP_DRAFTS_FULL_ACTION;

    /**
     * The reason the user can't create an app draft in the given organization, if applicable.
     */
    protected newAppDisabledReason(organization: Organization): string | undefined {
        const { activeAppDraftCount, activeAppDraftLimit } = organization;

        return quotaLevel(activeAppDraftCount, activeAppDraftLimit) === "full"
            ? `You've reached your limit of ${activeAppDraftLimit} app drafts. ${APP_DRAFTS_FULL_ACTION}`
            : undefined;
    }

    protected createAppDraftErrorMessage(error: OrgDashboardCreateAppDraftError): string {
        switch (error.kind) {
            case "unauthenticated":
                return UNAUTHENTICATED_MESSAGE;
            case "permissionDenied":
                return "You don't have permission to create apps in this organization.";
            case "resourceLimitExceeded":
                return `You've reached your limit of app drafts. ${APP_DRAFTS_FULL_ACTION}`;
            case "unavailable":
                return UNAVAILABLE_MESSAGE;
        }
    }

    protected listAppDraftsErrorMessage(error: OrgDashboardListAppDraftsError): string {
        switch (error.kind) {
            case "permissionDenied":
                return "You don't have permission to view app drafts in this organization.";
            case "unavailable":
                return UNAVAILABLE_MESSAGE;
        }
    }

    protected dismissCreateError(): void {
        // Focus the new app button when dismissing the error so that focus doesn't fall back to the
        // document when the dismiss button is removed. This behavior is especially important for
        // users with accessibility needs.
        this.newAppButton().focus();
        this.dismissCreateAppDraftError.emit();
    }
}

/**
 * The state of an {@link OrgDashboardContent}.
 */
export interface OrgDashboardContentState {
    /**
     * The organization to show.
     */
    readonly organization: Organization;

    /**
     * The organization's app drafts.
     */
    readonly appDrafts: OrgDashboardAppDrafts;

    /**
     * The state of creating an app draft.
     */
    readonly createAppDraftState: LoadingButtonState;

    /**
     * The error from the last attempt to create an app draft, if applicable.
     */
    readonly createAppDraftError?: OrgDashboardCreateAppDraftError;
}

/**
 * An error which occurs when attempting to create an app draft from an {@link OrgDashboardContent}.
 *
 * - `unauthenticated`: the user isn't logged in.
 * - `permissionDenied`: the user isn't allowed to create apps in the organization.
 * - `resourceLimitExceeded`: the organization has reached its app draft limit.
 * - `unavailable`: creation failed for a reason outside of the user's control.
 */
export interface OrgDashboardCreateAppDraftError {
    readonly kind: "unauthenticated" | "permissionDenied" | "resourceLimitExceeded" | "unavailable";

    /**
     * The number of failed attempts in a row to create an app draft.
     */
    readonly failedAttempts: number;
}

/**
 * The state of the organization's app drafts on an {@link OrgDashboardContent}.
 */
export type OrgDashboardAppDrafts = OrgDashboardAppDraftsLoaded | OrgDashboardAppDraftsError;

/**
 * The organization's app drafts loaded successfully.
 */
interface OrgDashboardAppDraftsLoaded {
    readonly kind: "loaded";

    /**
     * Summaries of the app drafts to show.
     */
    readonly summaries: readonly AppDraftSummary[];
}

/**
 * Listing the organization's app drafts failed.
 */
interface OrgDashboardAppDraftsError {
    readonly kind: "error";

    /**
     * The error that occurred.
     */
    readonly error: OrgDashboardListAppDraftsError;
}

/**
 * An error which occurs when listing an organization's app drafts for an
 * {@link OrgDashboardContent}.
 *
 * - `permissionDenied`: the user isn't allowed to view the organization's app drafts.
 * - `unavailable`: listing failed for a reason outside of the user's control.
 */
interface OrgDashboardListAppDraftsError {
    readonly kind: "permissionDenied" | "unavailable";
}
