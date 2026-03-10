// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, OnInit, inject, signal } from "@angular/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";

import { showApiErrorSnackbar } from "../api-error-handler";
import { AuthService } from "../auth.service";

@Component({
    selector: "acc-login",
    templateUrl: "./login.component.html",
    styleUrl: "./login.component.scss",
    imports: [MatProgressSpinnerModule],
})
export class LoginComponent implements OnInit {
    private activatedRoute = inject(ActivatedRoute);
    private authService = inject(AuthService);
    private router = inject(Router);
    private snackbar = inject(MatSnackBar);

    readonly loading = signal(true);

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe((params) => {
            this.authService.logIn(params["code"], params["state"]).subscribe({
                next: (success) => {
                    if (success) {
                        this.router.navigate(["apps"]);
                    } else {
                        this.loading.set(false);
                    }
                },
                error: showApiErrorSnackbar(this.snackbar),
            });
        });
    }
}
