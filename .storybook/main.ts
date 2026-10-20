// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { StorybookConfig } from "@storybook/angular-vite";

const config: StorybookConfig = {
    addons: ["@storybook/addon-themes"],
    core: { disableTelemetry: true },
    framework: "@storybook/angular-vite",
    stories: ["../src/**/*.stories.ts"],
};

export default config;
