// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Edit, EditStatus } from '../edit';

@Component({
    selector: 'acc-edit-card',
    imports: [MatButtonModule, MatCardModule],
    templateUrl: './edit-card.component.html',
})
export class EditCardComponent {
    readonly edit = input.required<Edit>();
    readonly delete = output<string>();
    readonly submitForReview = output<string>();

    editStatusEnum = EditStatus;

    canDelete(): boolean {
        const edit = this.edit();

        return edit.status === EditStatus.Unsubmitted ||
            edit.status === EditStatus.Submitted;
    }

    onDelete(): void {
        this.delete.emit(this.edit().id);
    }

    onSubmitForReview(): void {
        this.submitForReview.emit(this.edit().id);
    }
}
