// SPDX-FileCopyrightText: © 2025 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only
//
import type { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: "login",
        loadComponent: () =>
            import("./components/login-container/login-container").then((m) => m.LoginContainer),
    },
];
