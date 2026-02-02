// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Draft, DraftStatus } from '../draft';

@Component({
    selector: 'acc-draft-card',
    imports: [MatButtonModule, MatCardModule],
    templateUrl: './draft-card.component.html',
})
export class DraftCardComponent {
    readonly draft = input.required<Draft>();
    readonly delete = output<string>();
    readonly submitForReview = output<string>();

    draftStatusEnum = DraftStatus;

    canDelete(): boolean {
        const draft = this.draft();
        return draft.status === DraftStatus.Unsubmitted ||
            draft.status === DraftStatus.Submitted;
    }

    onDelete(): void {
        this.delete.emit(this.draft().id);
    }

    onSubmitForReview(): void {
        this.submitForReview.emit(this.draft().id);
    }
}
