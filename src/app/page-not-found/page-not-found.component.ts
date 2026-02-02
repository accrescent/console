// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'acc-page-not-found',
    templateUrl: './page-not-found.component.html',
    styleUrl: './page-not-found.component.scss',
    imports: [MatButtonModule],
})
export class PageNotFoundComponent {}
