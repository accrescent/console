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
import type { Organization } from "../../../domain/ports/console/organization";
import { ConsoleScaffoldPage } from "../console-scaffold-page/console-scaffold-page";
import { OrgDashboardPage, type OrgDashboardPageLoaded } from "./org-dashboard-page";

const ORGANIZATION: Organization = {
    id: "org_21nsTL6hybsteGOPytcUzx",
    publishedAppLimit: 10,
    publishedAppCount: 3,
    activeAppDraftLimit: 3,
    activeAppDraftCount: 2,
};

const LOADED: OrgDashboardPageLoaded = {
    kind: "loaded",
    organization: ORGANIZATION,
    createAppDraftState: "idle",
};

const meta: Meta<OrgDashboardPage> = {
    component: OrgDashboardPage,
    decorators: [
        applicationConfig({ providers: [provideRouter([])] }),
        // Render inside the scaffold as the page is in the app
        moduleMetadata({ imports: [ConsoleScaffoldPage] }),
        componentWrapperDecorator(ConsoleScaffoldPage, { handset: false, logoutState: "idle" }),
    ],
    render: (args) => ({
        props: args,
        template: `<acc-org-dashboard-page class="block h-full" ${argsToTemplate(args)} />`,
    }),
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

type Story = StoryObj<OrgDashboardPage>;

export const Pending: Story = {
    args: {
        state: { kind: "pending" },
    },
};

export const Loading: Story = {
    args: {
        state: { kind: "loading" },
    },
};

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
        state: LOADED,
    },
};

export const CreatingAppDraftPending: Story = {
    args: {
        state: { ...LOADED, createAppDraftState: "pending" },
    },
};

export const CreatingAppDraftLoading: Story = {
    args: {
        state: { ...LOADED, createAppDraftState: "loading" },
    },
};

export const CreatingAppDraftFailed: Story = {
    args: {
        state: {
            ...LOADED,
            createAppDraftError: { kind: "unavailable", failedAttempts: 1 },
        },
    },
};

export const CreatingAppDraftPermissionDenied: Story = {
    args: {
        state: {
            ...LOADED,
            createAppDraftError: { kind: "permissionDenied", failedAttempts: 1 },
        },
    },
};

export const CreatingAppDraftLimitReached: Story = {
    args: {
        state: {
            ...LOADED,
            organization: {
                ...ORGANIZATION,
                activeAppDraftCount: ORGANIZATION.activeAppDraftLimit,
            },
            createAppDraftError: { kind: "resourceLimitExceeded", failedAttempts: 1 },
        },
    },
};

export const AtLimits: Story = {
    args: {
        state: {
            ...LOADED,
            organization: {
                ...ORGANIZATION,
                publishedAppCount: ORGANIZATION.publishedAppLimit,
                activeAppDraftCount: ORGANIZATION.activeAppDraftLimit,
            },
        },
    },
};

export const Empty: Story = {
    args: {
        state: {
            ...LOADED,
            organization: { ...ORGANIZATION, publishedAppCount: 0, activeAppDraftCount: 0 },
        },
    },
};
