// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { provideRouter } from "@angular/router";
import { applicationConfig, type Meta, type StoryObj } from "@storybook/angular-vite";

import { ConsoleScaffoldLayout } from "./console-scaffold-layout";

const meta: Meta<ConsoleScaffoldLayout> = {
    component: ConsoleScaffoldLayout,
    decorators: [applicationConfig({ providers: [provideRouter([])] })],
    args: {
        logoutState: "idle",
    },
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

type Story = StoryObj<ConsoleScaffoldLayout>;

export const Idle: Story = {};

export const LogoutPending: Story = {
    args: {
        logoutState: "pending",
    },
};

export const LoggingOut: Story = {
    args: {
        logoutState: "loading",
    },
};
