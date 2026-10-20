// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { provideRouter } from "@angular/router";
import { applicationConfig, type Meta, type StoryObj } from "@storybook/angular-vite";
import { NotFoundPage } from "./not-found-page";

const meta: Meta<NotFoundPage> = {
    component: NotFoundPage,
    decorators: [applicationConfig({ providers: [provideRouter([])] })],
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

type Story = StoryObj<NotFoundPage>;

export const Default: Story = {};
