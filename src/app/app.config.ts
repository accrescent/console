// Copyright 2025 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';

import { GlobalErrorHandler } from './global-error-handler';
import { routes } from './app.routes';
import { unauthorizedInterceptor } from './unauthorized.interceptor';
import { withCredentialsInterceptor } from './with-credentials.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler,
        },
        provideHttpClient(withInterceptors([unauthorizedInterceptor, withCredentialsInterceptor])),
        {
            provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
            useValue: { duration: 5000 },
        },
        provideRouter(routes),
        provideZoneChangeDetection({ eventCoalescing: true }),
    ],
};
