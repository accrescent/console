// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { HttpErrorResponse } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";

import { isApiError } from "./api-error";

export function showApiErrorSnackbar(snackbar: MatSnackBar): (error: unknown) => void {
    return (error: unknown) => {
        if (error instanceof HttpErrorResponse && isApiError(error.error)) {
            snackbar.open(error.error.message);
        } else {
            console.error(error);
        }
    };
}
