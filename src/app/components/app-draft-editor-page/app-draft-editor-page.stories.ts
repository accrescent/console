// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { signal } from "@angular/core";
import { provideRouter } from "@angular/router";
import {
    applicationConfig,
    argsToTemplate,
    componentWrapperDecorator,
    type Meta,
    moduleMetadata,
    type StoryObj,
} from "@storybook/angular-vite";

import type { AppListingText } from "../../../domain/app-listing";
import type { AppDraftEditorContentState } from "../app-draft-editor-content/app-draft-editor-content";
import { ConsoleScaffoldLayout } from "../console-scaffold-layout/console-scaffold-layout";
import { AppDraftEditorPage, type AppDraftEditorPageState } from "./app-draft-editor-page";

const APP_DRAFT_ID = "ad_5gKq2YbVxPz8RmT3nWc1Ha";

const LISTING: AppListingText = {
    name: "Weather",
    shortDescription: "Private forecasts for wherever you are, with no tracking",
};

const NEW: AppDraftEditorContentState = {
    saveListingState: "idle",
    reloadListingState: "idle",
    deleteAppDraftState: "idle",
};

const WITH_LISTING: AppDraftEditorContentState = {
    ...NEW,
    listing: LISTING,
};

function loaded(value: AppDraftEditorContentState): AppDraftEditorPageState {
    return { kind: "loaded", value };
}

const meta: Meta<AppDraftEditorPage> = {
    component: AppDraftEditorPage,
    decorators: [
        applicationConfig({ providers: [provideRouter([])] }),
        // Render inside the scaffold as the page is in the app
        moduleMetadata({ imports: [ConsoleScaffoldLayout] }),
        componentWrapperDecorator(ConsoleScaffoldLayout, { logoutState: "idle" }),
    ],
    render: (args) => ({
        props: args,
        template: `<acc-app-draft-editor-page ${argsToTemplate(args)} />`,
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

function afterFirstSave(result: Partial<AppDraftEditorContentState>): Story {
    const story: Story = {
        render: () => {
            const state = signal(loaded(NEW));
            return {
                props: { state, onSave: () => state.set(loaded({ ...NEW, ...result })) },
                template: `<acc-app-draft-editor-page [state]="state()" (saveListing)="onSave()" />`,
            };
        },
        play: async ({ canvas, userEvent }) => {
            await userEvent.type(canvas.getByRole("textbox", { name: "App name" }), LISTING.name);
            await userEvent.type(
                canvas.getByRole("textbox", { name: "Short description" }),
                LISTING.shortDescription,
            );
            await userEvent.click(canvas.getByRole("button", { name: "Save listing" }));
        },
    };
    return story;
}

export const LoadingFailed: Story = {
    args: {
        state: {
            kind: "error",
            error: { kind: "unavailable", resource: { kind: "appDraft", id: APP_DRAFT_ID } },
        },
    },
};

export const LoadingPermissionDenied: Story = {
    args: {
        state: {
            kind: "error",
            error: { kind: "permissionDenied", resource: { kind: "appDraft", id: APP_DRAFT_ID } },
        },
    },
};

export const New: Story = {
    args: {
        state: loaded(NEW),
    },
};

export const WithListing: Story = {
    args: {
        state: loaded(WITH_LISTING),
    },
};

export const SavingListingPending: Story = afterFirstSave({ saveListingState: "pending" });

export const SavingListingLoading: Story = afterFirstSave({ saveListingState: "loading" });

export const SavingListingFailed: Story = afterFirstSave({
    saveListingError: { kind: "unavailable", failedAttempts: 1 },
});

export const SavingListingConflict: Story = {
    args: {
        state: loaded({
            ...WITH_LISTING,
            saveListingError: { kind: "conflict", failedAttempts: 1 },
        }),
    },
    // Drafts with a listing open on the next step, so go back to where the error is shown
    play: async ({ canvas, userEvent }) => {
        await userEvent.click(canvas.getByText("Add store listing"));
    },
};

export const ReloadingListingLoading: Story = {
    args: {
        state: loaded({
            ...WITH_LISTING,
            saveListingError: { kind: "conflict", failedAttempts: 1 },
            reloadListingState: "loading",
        }),
    },
    // Drafts with a listing open on the next step, so go back to where the error is shown
    play: async ({ canvas, userEvent }) => {
        await userEvent.click(canvas.getByText("Add store listing"));
    },
};

export const SavingListingUnauthenticated: Story = afterFirstSave({
    saveListingError: { kind: "unauthenticated", failedAttempts: 1 },
});

export const DeleteDialogOpen: Story = {
    args: {
        state: loaded(NEW),
    },
    play: openDeleteDialog,
};

export const DeletionPending: Story = {
    args: {
        state: loaded({ ...NEW, deleteAppDraftState: "pending" }),
    },
    play: openDeleteDialog,
};

export const DeletionLoading: Story = {
    args: {
        state: loaded({ ...NEW, deleteAppDraftState: "loading" }),
    },
    play: openDeleteDialog,
};

export const DeletionFailed: Story = {
    args: {
        state: loaded({ ...NEW, deleteAppDraftError: { kind: "unavailable", failedAttempts: 1 } }),
    },
    play: openDeleteDialog,
};

export const DeletionUnauthenticated: Story = {
    args: {
        state: loaded({
            ...NEW,
            deleteAppDraftError: { kind: "unauthenticated", failedAttempts: 1 },
        }),
    },
    play: openDeleteDialog,
};

export const DeletionPermissionDenied: Story = {
    args: {
        state: loaded({
            ...NEW,
            deleteAppDraftError: { kind: "permissionDenied", failedAttempts: 1 },
        }),
    },
    play: openDeleteDialog,
};
