// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { argsToTemplate, type Meta, type StoryObj } from "@storybook/angular-vite";
import { LoadingButton } from "./loading-button";

const meta: Meta<LoadingButton> = {
    component: LoadingButton,
    args: {
        appearance: "text",
        state: "idle",
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

export const Pending: Story = {
    args: {
        state: "pending",
    },
};

export const Loading: Story = {
    args: {
        state: "loading",
    },
};

export const FilledIdle: Story = {
    args: {
        appearance: "filled",
    },
};

export const FilledPending: Story = {
    args: {
        appearance: "filled",
        state: "pending",
    },
};

export const FilledLoading: Story = {
    args: {
        appearance: "filled",
        state: "loading",
    },
};

export const DisabledWithReason: Story = {
    args: {
        appearance: "filled",
        disabledReason: "Nothing to save",
    },
};
