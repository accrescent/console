// SPDX-FileCopyrightText: © 2025 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { DOCUMENT } from "@angular/common";
import { type ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";

import { RemoteAuthnApi } from "../adapters/authn/remote/remote-authn-api";
import { GrpcWebConsoleApi } from "../adapters/console/grpcweb/grpc-web-console-api";
import { routes } from "./app.routes";
import { AUTHN_API, CONSOLE_API } from "./tokens";

const CONSOLE_API_URL = "/";
const DEFAULT_TIMEOUT_MS = 10_000;

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes, withComponentInputBinding()),
        {
            provide: AUTHN_API,
            useFactory: () => new RemoteAuthnApi(inject(DOCUMENT), DEFAULT_TIMEOUT_MS),
        },
        {
            provide: CONSOLE_API,
            useFactory: () => new GrpcWebConsoleApi(CONSOLE_API_URL, DEFAULT_TIMEOUT_MS),
        },
    ],
};
