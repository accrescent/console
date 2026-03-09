// SPDX-FileCopyrightText: © 2024 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";

export default defineConfig([
    {
        files: ["**/*.ts"],
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommended,
            angular.configs.tsRecommended,
        ],
        processor: angular.processInlineTemplates,
        rules: {
            "@angular-eslint/directive-selector": [
                "error",
                {
                    type: "attribute",
                    prefix: "acc",
                    style: "camelCase",
                },
            ],
            "@angular-eslint/component-selector": [
                "error",
                {
                    type: "element",
                    prefix: "acc",
                    style: "kebab-case",
                },
            ],
            "@typescript-eslint/explicit-function-return-type": "error",
            eqeqeq: ["error", "always"],
        },
    },
    {
        files: ["**/*.html"],
        extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
        rules: {},
    },
]);
