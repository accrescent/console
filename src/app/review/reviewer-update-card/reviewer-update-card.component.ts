// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, OnInit, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Update } from '../../update';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'acc-reviewer-update-card',
    imports: [MatButtonModule, MatCardModule],
    templateUrl: './reviewer-update-card.component.html',
})
export class ReviewerUpdateCardComponent implements OnInit {
    readonly update = input.required<Update>();
    readonly postReview = output<string>();
    apkSetLink?: string;

    ngOnInit(): void {
        this.apkSetLink = `${environment.developerApiUrl}/api/v1/updates/${this.update().id}/apkset`;
    }

    onPostReview(): void {
        this.postReview.emit(this.update().id);
    }
}
