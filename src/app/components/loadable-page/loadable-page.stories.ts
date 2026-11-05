// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { type Meta, moduleMetadata, type StoryObj } from "@storybook/angular-vite";

import { LoadablePage, type PageLoading, type PagePending } from "./loadable-page";

interface Args {
    readonly state: PagePending | PageLoading;
}

const meta: Meta<Args> = {
    // LoadablePage is a structural directive, so it needs a template to attach to
    decorators: [moduleMetadata({ imports: [LoadablePage] })],
    render: (args) => ({
        props: args,
        template: `<ng-template [accLoadablePage]="state" />`,
    }),
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

type Story = StoryObj<Args>;

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
