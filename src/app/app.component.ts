// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'acc-root',
    templateUrl: './app.component.html',
    imports: [RouterOutlet],
})
export class AppComponent {
    title = 'console';
}
