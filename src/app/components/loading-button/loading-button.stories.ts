// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { argsToTemplate, type Meta, type StoryObj } from "@storybook/angular-vite";
import { LoadingButton } from "./loading-button";

const meta: Meta<LoadingButton> = {
    component: LoadingButton,
    args: {
        appearance: "text",
        loading: false,
        loadingLabel: "Saving",
    },
    // Project the label, which the default render doesn't do
    render: (args) => ({
        props: args,
        template: `<acc-loading-button ${argsToTemplate(args)}>Save</acc-loading-button>`,
    }),
};

export default meta;

type Story = StoryObj<LoadingButton>;

export const Idle: Story = {};

export const Loading: Story = {
    args: {
        loading: true,
    },
};

export const FilledIdle: Story = {
    args: {
        appearance: "filled",
    },
};

export const FilledLoading: Story = {
    args: {
        appearance: "filled",
        loading: true,
    },
};
