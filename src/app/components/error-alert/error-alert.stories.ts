// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { MatButton } from "@angular/material/button";
import { argsToTemplate, type Meta, moduleMetadata, type StoryObj } from "@storybook/angular-vite";

import { ErrorAlert } from "./error-alert";

const meta: Meta<ErrorAlert> = {
    component: ErrorAlert,
    args: {
        heading: "Could not create the document",
        message: "You do not have sufficient permissions to create a document.",
        failedAttempts: 1,
        dismissible: true,
    },
};

export default meta;

type Story = StoryObj<ErrorAlert>;

export const OneFailedAttempt: Story = {};

export const MultipleFailedAttempts: Story = {
    args: { failedAttempts: 3 },
};

export const NotDismissible: Story = {
    args: { dismissible: false },
};

export const WithAction: Story = {
    decorators: [moduleMetadata({ imports: [MatButton] })],
    render: (args) => ({
        props: args,
        template: `
            <acc-error-alert ${argsToTemplate(args)}>
                <button matButton="filled" class="mt-1 self-start" type="button">Fix it</button>
            </acc-error-alert>
        `,
    }),
};

export const WithActionAndMultipleFailedAttempts: Story = {
    ...WithAction,
    args: { failedAttempts: 3 },
};
