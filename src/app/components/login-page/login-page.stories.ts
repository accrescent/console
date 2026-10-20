// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { Meta, StoryObj } from "@storybook/angular-vite";
import { LoginPage } from "./login-page";

const meta: Meta<LoginPage> = {
    component: LoginPage,
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

type Story = StoryObj<LoginPage>;

export const Default: Story = {};

export const Loading: Story = {
    args: {
        loading: true,
    },
};
