// SPDX-FileCopyrightText: © 2025 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { DOCUMENT } from "@angular/common";
import { type ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter } from "@angular/router";

import { RemoteAuthnApi } from "../adapters/authn/remote/remote-authn-api";
import { routes } from "./app.routes";
import { AUTHN_API } from "./tokens";

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        { provide: AUTHN_API, useFactory: () => new RemoteAuthnApi(inject(DOCUMENT)) },
    ],
};
