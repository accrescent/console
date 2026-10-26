// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { provideRouter } from "@angular/router";
import { applicationConfig, type Meta, type StoryObj } from "@storybook/angular-vite";
import { ConsoleScaffoldPage } from "./console-scaffold-page";

const meta: Meta<ConsoleScaffoldPage> = {
    component: ConsoleScaffoldPage,
    decorators: [applicationConfig({ providers: [provideRouter([])] })],
    args: {
        handset: false,
        logoutState: "idle",
    },
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

type Story = StoryObj<ConsoleScaffoldPage>;

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

export const Handset: Story = {
    args: {
        handset: true,
    },
    globals: {
        viewport: { value: "mobile2", isRotated: false },
    },
};
