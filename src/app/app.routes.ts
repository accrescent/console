// SPDX-FileCopyrightText: © 2025 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only
//
import type { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: "",
        pathMatch: "full",
        loadComponent: () =>
            import("./components/home-container/home-container").then((m) => m.HomeContainer),
    },
    {
        path: "login",
        loadComponent: () =>
            import("./components/login-container/login-container").then((m) => m.LoginContainer),
    },
    {
        path: "",
        loadComponent: () =>
            import("./components/console-scaffold-container/console-scaffold-container").then(
                (m) => m.ConsoleScaffoldContainer,
            ),
        children: [
            {
                path: "dashboard",
                loadComponent: () =>
                    import("./components/dashboard-page/dashboard-page").then(
                        (m) => m.DashboardPage,
                    ),
            },
        ],
    },
    {
        path: "**",
        loadComponent: () =>
            import("./components/not-found-page/not-found-page").then((m) => m.NotFoundPage),
    },
];
