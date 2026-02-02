// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Update, UpdateStatus } from '../update';

@Component({
    selector: 'acc-update-card',
    imports: [MatButtonModule, MatCardModule],
    templateUrl: './update-card.component.html',
})
export class UpdateCardComponent {
    readonly update = input.required<Update>();
    readonly delete = output<string>();
    readonly submitForReview = output<string>();

    updateStatusEnum = UpdateStatus;

    canDelete(): boolean {
        const update = this.update();

        return update.status === UpdateStatus.Unsubmitted ||
            update.status === UpdateStatus.PendingReview;
    }

    onDelete(): void {
        this.delete.emit(this.update().id);
    }

    onSubmitForReview(): void {
        this.submitForReview.emit(this.update().id);
    }
}
