// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { provideRouter } from "@angular/router";
import {
    applicationConfig,
    argsToTemplate,
    componentWrapperDecorator,
    type Meta,
    moduleMetadata,
    type StoryObj,
} from "@storybook/angular-vite";
import { ConsoleScaffoldPage } from "../console-scaffold-page/console-scaffold-page";
import { AppDraftEditorPage } from "./app-draft-editor-page";

const meta: Meta<AppDraftEditorPage> = {
    component: AppDraftEditorPage,
    decorators: [
        applicationConfig({ providers: [provideRouter([])] }),
        // Render inside the scaffold as the page is in the app
        moduleMetadata({ imports: [ConsoleScaffoldPage] }),
        componentWrapperDecorator(ConsoleScaffoldPage, { handset: false, logoutState: "idle" }),
    ],
    render: (args) => ({
        props: args,
        template: `<acc-app-draft-editor-page class="block h-full" ${argsToTemplate(args)} />`,
    }),
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

type Story = StoryObj<AppDraftEditorPage>;

const openDeleteDialog: Story["play"] = async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete draft" }));
};

export const Idle: Story = {
    args: {
        state: { deleteAppDraftState: "idle" },
    },
};

export const DeleteDialogOpen: Story = {
    args: {
        state: { deleteAppDraftState: "idle" },
    },
    play: openDeleteDialog,
};

export const DeletionPending: Story = {
    args: {
        state: { deleteAppDraftState: "pending" },
    },
    play: openDeleteDialog,
};

export const DeletionLoading: Story = {
    args: {
        state: { deleteAppDraftState: "loading" },
    },
    play: openDeleteDialog,
};

export const DeletionFailed: Story = {
    args: {
        state: {
            deleteAppDraftState: "idle",
            deleteAppDraftError: { kind: "unavailable", failedAttempts: 1 },
        },
    },
    play: openDeleteDialog,
};

export const DeletionPermissionDenied: Story = {
    args: {
        state: {
            deleteAppDraftState: "idle",
            deleteAppDraftError: { kind: "permissionDenied", failedAttempts: 1 },
        },
    },
    play: openDeleteDialog,
};
