// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../auth.service';

@Component({
    selector: 'acc-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    imports: [MatProgressSpinnerModule],
})
export class LoginComponent implements OnInit {
    private authService = inject(AuthService);
    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);

    loading = true;

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(params => {
            this.authService.logIn(params['code'], params['state']).subscribe(success => {
                if (success) {
                    this.router.navigate(['apps']);
                } else {
                    this.loading = false;
                }
            });
        });
    }
}
