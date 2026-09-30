// SPDX-FileCopyrightText: © 2025 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Routes } from "@angular/router";

import { authGuard } from "./auth.guard";

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import("./console-layout/console-layout").then((m) => m.ConsoleLayout),
        canActivate: [authGuard],
        children: [
            { path: "", redirectTo: "apps", pathMatch: "full" },
            {
                path: "apps",
                loadComponent: () => import("./apps-screen/apps-screen").then((m) => m.AppsScreen),
            },
            {
                path: "apps/:id/details",
                loadComponent: () =>
                    import("./app-details-screen/app-details-screen").then(
                        (m) => m.AppDetailsScreen,
                    ),
            },
            {
                path: "drafts/new",
                loadComponent: () =>
                    import("./new-draft-screen/new-draft-screen").then((m) => m.NewDraftScreen),
            },
            {
                path: "review",
                loadChildren: () => import("./review/review.routes").then((m) => m.REVIEW_ROUTES),
            },
            {
                path: "publish",
                loadChildren: () =>
                    import("./publish/publish.routes").then((m) => m.PUBLISH_ROUTES),
            },
        ],
    },
    {
        path: "login",
        loadComponent: () => import("./login-screen/login-screen").then((m) => m.LoginScreen),
    },
    {
        path: "auth/github/callback",
        loadComponent: () => import("./login/login").then((m) => m.Login),
    },
    {
        path: "**",
        loadComponent: () => import("./page-not-found/page-not-found").then((m) => m.PageNotFound),
    },
];
