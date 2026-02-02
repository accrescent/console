// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { Review } from '../review';
import { ReviewEditorComponent } from '../review-editor/review-editor.component';

@Component({
    selector: 'acc-review-dialog',
    imports: [MatButtonModule, MatDialogModule, ReviewEditorComponent],
    templateUrl: './review-dialog.component.html',
})
export class ReviewDialogComponent {
    private dialogRef = inject<MatDialogRef<ReviewDialogComponent>>(MatDialogRef);

    closeWithReview(review: Review): void {
        this.dialogRef.close(review);
    }
}
