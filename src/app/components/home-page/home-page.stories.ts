// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { Meta, StoryObj } from "@storybook/angular-vite";
import { HomePage, HomePageState } from "./home-page";

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
        state: HomePageState.Loading,
    },
};

export const LoadingFailed: Story = {
    args: {
        state: HomePageState.LoadingFailed,
    },
};

export const Reloading: Story = {
    args: {
        state: HomePageState.Reloading,
    },
};
