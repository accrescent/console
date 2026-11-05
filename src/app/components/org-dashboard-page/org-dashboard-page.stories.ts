// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { provideRouter } from "@angular/router";
import {
    applicationConfig,
    argsToTemplate,
    componentWrapperDecorator,
    type Meta,
    moduleMetadata,
    type StoryObj,
} from "@storybook/angular-vite";

import type { AppDraftSummary } from "../../../domain/ports/console/app-draft-summary";
import type { Organization } from "../../../domain/ports/console/organization";
import { fakeIconUrl } from "../../../storybook/fake-icon-url";
import { ConsoleScaffoldLayout } from "../console-scaffold-layout/console-scaffold-layout";
import type { OrgDashboardContentState } from "../org-dashboard-content/org-dashboard-content";
import { OrgDashboardPage, type OrgDashboardPageState } from "./org-dashboard-page";

const ORGANIZATION: Organization = {
    id: "org_21nsTL6hybsteGOPytcUzx",
    publishedAppLimit: 10,
    publishedAppCount: 3,
    activeAppDraftLimit: 3,
    activeAppDraftCount: 2,
};

const APP_DRAFTS: readonly AppDraftSummary[] = [
    {
        id: "draft_5gKq2YbVxPz8RmT3nWc1Ha",
        name: "Weather",
        iconUrl: fakeIconUrl("#1e88e5", "#ffca28"),
        package: { versionName: "1.2.0", androidApplicationId: "com.example.weather" },
    },
    { id: "draft_7hLr3ZcWyQa9SnU4oXd2Ib" },
];

const APP_DRAFTS_AT_LIMIT: readonly AppDraftSummary[] = [
    ...APP_DRAFTS,
    {
        id: "draft_9jNt5BeYaSc1UpW6qZf4Kd",
        name: "Notes",
        iconUrl: fakeIconUrl("#43a047", "#fafafa"),
        package: { versionName: "3.0.1", androidApplicationId: "com.example.notes" },
    },
];

const LOADED: OrgDashboardContentState = {
    organization: ORGANIZATION,
    appDrafts: { kind: "loaded", summaries: APP_DRAFTS },
    createAppDraftState: "idle",
};

function loaded(value: OrgDashboardContentState): OrgDashboardPageState {
    return { kind: "loaded", value };
}

const meta: Meta<OrgDashboardPage> = {
    component: OrgDashboardPage,
    decorators: [
        applicationConfig({ providers: [provideRouter([])] }),
        // Render inside the scaffold as the page is in the app
        moduleMetadata({ imports: [ConsoleScaffoldLayout] }),
        componentWrapperDecorator(ConsoleScaffoldLayout, { logoutState: "idle" }),
    ],
    render: (args) => ({
        props: args,
        template: `<acc-org-dashboard-page ${argsToTemplate(args)} />`,
    }),
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

type Story = StoryObj<OrgDashboardPage>;

export const LoadingFailed: Story = {
    args: {
        state: {
            kind: "error",
            error: { kind: "unavailable", resource: { kind: "organization", id: ORGANIZATION.id } },
        },
    },
};

export const PermissionDenied: Story = {
    args: {
        state: {
            kind: "error",
            error: {
                kind: "permissionDenied",
                resource: { kind: "organization", id: ORGANIZATION.id },
            },
        },
    },
};

export const Loaded: Story = {
    args: {
        state: loaded(LOADED),
    },
};

export const ListingAppDraftsFailed: Story = {
    args: {
        state: loaded({
            ...LOADED,
            appDrafts: { kind: "error", error: { kind: "unavailable" } },
        }),
    },
};

export const ListingAppDraftsPermissionDenied: Story = {
    args: {
        state: loaded({
            ...LOADED,
            appDrafts: { kind: "error", error: { kind: "permissionDenied" } },
        }),
    },
};

export const CreatingAppDraftPending: Story = {
    args: {
        state: loaded({ ...LOADED, createAppDraftState: "pending" }),
    },
};

export const CreatingAppDraftLoading: Story = {
    args: {
        state: loaded({ ...LOADED, createAppDraftState: "loading" }),
    },
};

export const CreatingAppDraftFailed: Story = {
    args: {
        state: loaded({
            ...LOADED,
            createAppDraftError: { kind: "unavailable", failedAttempts: 1 },
        }),
    },
};

export const CreatingAppDraftUnauthenticated: Story = {
    args: {
        state: loaded({
            ...LOADED,
            createAppDraftError: { kind: "unauthenticated", failedAttempts: 1 },
        }),
    },
};

export const CreatingAppDraftPermissionDenied: Story = {
    args: {
        state: loaded({
            ...LOADED,
            createAppDraftError: { kind: "permissionDenied", failedAttempts: 1 },
        }),
    },
};

export const CreatingAppDraftLimitReached: Story = {
    args: {
        state: loaded({
            ...LOADED,
            organization: {
                ...ORGANIZATION,
                activeAppDraftCount: ORGANIZATION.activeAppDraftLimit,
            },
            appDrafts: { kind: "loaded", summaries: APP_DRAFTS_AT_LIMIT },
            createAppDraftError: { kind: "resourceLimitExceeded", failedAttempts: 1 },
        }),
    },
};

export const AtLimits: Story = {
    args: {
        state: loaded({
            ...LOADED,
            organization: {
                ...ORGANIZATION,
                publishedAppCount: ORGANIZATION.publishedAppLimit,
                activeAppDraftCount: ORGANIZATION.activeAppDraftLimit,
            },
            appDrafts: { kind: "loaded", summaries: APP_DRAFTS_AT_LIMIT },
        }),
    },
};

export const Empty: Story = {
    args: {
        state: loaded({
            ...LOADED,
            organization: { ...ORGANIZATION, publishedAppCount: 0, activeAppDraftCount: 0 },
            appDrafts: { kind: "loaded", summaries: [] },
        }),
    },
};
