// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { Meta, StoryObj } from "@storybook/angular-vite";
import { ErrorAlert } from "./error-alert";

const meta: Meta<ErrorAlert> = {
    component: ErrorAlert,
    args: {
        heading: "Could not create the document",
        message: "You do not have sufficient permissions to create a document.",
        failedAttempts: 1,
    },
};

export default meta;

type Story = StoryObj<ErrorAlert>;

export const OneFailedAttempt: Story = {};

export const MultipleFailedAttempts: Story = {
    args: { failedAttempts: 3 },
};
