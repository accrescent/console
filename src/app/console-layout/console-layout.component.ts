// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from '../auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
    selector: 'acc-console-layout',
    templateUrl: './console-layout.component.html',
    styleUrl: './console-layout.component.scss',
    imports: [
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule,
        MatToolbarModule,
        RouterLink,
        RouterOutlet,
    ],
})
export class ConsoleLayoutComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    get reviewer(): boolean {
        return this.authService.reviewer;
    }

    get publisher(): boolean {
        return this.authService.publisher;
    }

    logOut(): void {
        this.authService.logOut().subscribe(() => this.router.navigate(['/login']));
    }
}
