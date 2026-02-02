// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Edit } from '../../edit';

@Component({
    selector: 'acc-reviewer-edit-card',
    imports: [MatButtonModule, MatCardModule],
    templateUrl: './reviewer-edit-card.component.html',
})
export class ReviewerEditCardComponent {
    readonly edit = input.required<Edit>();
    readonly postReview = output<string>();

    onPostReview(): void {
        this.postReview.emit(this.edit().id);
    }
}
