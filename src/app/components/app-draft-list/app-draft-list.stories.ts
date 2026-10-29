// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { provideRouter } from "@angular/router";
import { applicationConfig, type Meta, type StoryObj } from "@storybook/angular-vite";

import { fakeIconUrl } from "../../../storybook/fake-icon-url";
import { AppDraftList } from "./app-draft-list";

const meta: Meta<AppDraftList> = {
    component: AppDraftList,
    decorators: [applicationConfig({ providers: [provideRouter([])] })],
    args: {
        orgId: "org_1",
    },
};

export default meta;

type Story = StoryObj<AppDraftList>;

export const Populated: Story = {
    args: {
        // Every combination of present and missing details
        appDrafts: [
            {
                id: "draft_1",
                name: "Weather",
                iconUrl: fakeIconUrl("#1e88e5", "#ffca28"),
                package: { versionName: "1.2.0", androidApplicationId: "com.example.weather" },
            },
            { id: "draft_2", name: "Notes", iconUrl: fakeIconUrl("#43a047", "#fafafa") },
            {
                id: "draft_3",
                name: "Calculator",
                package: { versionName: "4.0.0", androidApplicationId: "com.example.calculator" },
            },
            { id: "draft_4", name: "Podcasts" },
            {
                id: "draft_5",
                iconUrl: fakeIconUrl("#f4511e", "#fff3e0"),
                package: { versionName: "0.3.1", androidApplicationId: "com.example.recipes" },
            },
            { id: "draft_6", iconUrl: fakeIconUrl("#8e24aa", "#e1bee7") },
            {
                id: "draft_7",
                package: { versionName: "2.1.0", androidApplicationId: "com.example.timer" },
            },
            { id: "draft_8" },
        ],
    },
};

export const Empty: Story = {
    args: {
        appDrafts: [],
    },
};
