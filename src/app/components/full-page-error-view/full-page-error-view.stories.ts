// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { provideRouter } from "@angular/router";
import { applicationConfig, type Meta, type StoryObj } from "@storybook/angular-vite";
import { FullPageErrorView } from "./full-page-error-view";

const ORGANIZATION_ID = "org_21nsTL6hybsteGOPytcUzx";

const meta: Meta<FullPageErrorView> = {
    component: FullPageErrorView,
    decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;

type Story = StoryObj<FullPageErrorView>;

export const ConsoleUnavailable: Story = {
    args: {
        error: { kind: "unavailable", resource: { kind: "console" } },
    },
};

export const OrganizationUnavailable: Story = {
    args: {
        error: { kind: "unavailable", resource: { kind: "organization", id: ORGANIZATION_ID } },
    },
};

export const OrganizationPermissionDenied: Story = {
    args: {
        error: {
            kind: "permissionDenied",
            resource: { kind: "organization", id: ORGANIZATION_ID },
        },
    },
};
