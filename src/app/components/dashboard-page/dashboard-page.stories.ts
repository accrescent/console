// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { Meta, StoryObj } from "@storybook/angular-vite";
import { DashboardPage } from "./dashboard-page";

const meta: Meta<DashboardPage> = {
    component: DashboardPage,
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

type Story = StoryObj<DashboardPage>;

export const Default: Story = {};
