// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { provideRouter } from "@angular/router";
import {
    applicationConfig,
    componentWrapperDecorator,
    type Meta,
    moduleMetadata,
    type StoryObj,
} from "@storybook/angular-vite";
import { ConsoleScaffoldPage } from "../console-scaffold-page/console-scaffold-page";
import { DashboardPage } from "./dashboard-page";

const meta: Meta<DashboardPage> = {
    component: DashboardPage,
    decorators: [
        applicationConfig({ providers: [provideRouter([])] }),
        // Render inside the scaffold as the page is in the app
        moduleMetadata({ imports: [ConsoleScaffoldPage] }),
        componentWrapperDecorator(ConsoleScaffoldPage, { handset: false, loggingOut: false }),
    ],
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

type Story = StoryObj<DashboardPage>;

export const Default: Story = {};
