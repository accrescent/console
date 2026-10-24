// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { Meta, StoryObj } from "@storybook/angular-vite";
import { HomePage } from "./home-page";

const meta: Meta<HomePage> = {
    component: HomePage,
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

type Story = StoryObj<HomePage>;

export const Loading: Story = {
    args: {
        state: { kind: "loading" },
    },
};

export const LoadingFailed: Story = {
    args: {
        state: { kind: "error", error: { kind: "unavailable", resource: { kind: "console" } } },
    },
};
