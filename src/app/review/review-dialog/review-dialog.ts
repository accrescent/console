// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";

import type { Review } from "../review";
import { ReviewEditor } from "../review-editor/review-editor";

@Component({
    selector: "acc-review-dialog",
    imports: [MatButtonModule, MatDialogModule, ReviewEditor],
    templateUrl: "./review-dialog.component.html",
})
export class ReviewDialog {
    private dialogRef = inject<MatDialogRef<ReviewDialog>>(MatDialogRef);

    closeWithReview(review: Review): void {
        this.dialogRef.close(review);
    }
}
