// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

import { App } from '../app';

@Component({
    selector: 'acc-app-card',
    imports: [MatButtonModule, MatCardModule, RouterLink],
    templateUrl: './app-card.component.html',
})
export class AppCardComponent {
    readonly app = input.required<App>();
}
