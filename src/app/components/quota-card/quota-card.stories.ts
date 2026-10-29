// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { Meta, StoryObj } from "@storybook/angular-vite";

import { QuotaCard } from "./quota-card";

const meta: Meta<QuotaCard> = {
    component: QuotaCard,
    args: {
        label: "Published apps",
        description: "Apps available in the store",
        icon: "storefront",
        fullAction: "Check back later for a way to increase this limit.",
    },
};

export default meta;

type Story = StoryObj<QuotaCard>;

export const Available: Story = {
    args: {
        count: 3,
        limit: 10,
    },
};

export const NearlyFull: Story = {
    args: {
        count: 9,
        limit: 10,
    },
};

export const Full: Story = {
    args: {
        count: 10,
        limit: 10,
    },
};
