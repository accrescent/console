// Copyright 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { ErrorHandler, Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { isApiError } from './api-error';

@Injectable({
    providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
    private snackbar = inject(MatSnackBar);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleError(error: any): void {
        if (error instanceof HttpErrorResponse && isApiError(error.error)) {
            this.snackbar.open(error.error.message);
        } else {
            console.error(error);
        }
    }
}
