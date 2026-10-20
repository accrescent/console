// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/angular-vite";

const preview: Preview = {
    decorators: [
        withThemeByDataAttribute({
            themes: {
                light: "light",
                dark: "dark",
            },
            defaultTheme: "dark",
        }),
    ],
};

export default preview;
