// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, OnInit, inject } from "@angular/core";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

import { Draft } from "../../draft";
import { Edit } from "../../edit";
import { showApiErrorSnackbar } from "../../api-error-handler";
import { DraftService } from "../draft.service";
import { EditService } from "../edit.service";
import { ReviewDialogComponent } from "../review-dialog/review-dialog.component";
import { ReviewerDraftCardComponent } from "../reviewer-draft-card/reviewer-draft-card.component";
import { ReviewerEditCardComponent } from "../reviewer-edit-card/reviewer-edit-card.component";
import { ReviewerUpdateCardComponent } from "../reviewer-update-card/reviewer-update-card.component";
import { Update } from "../../update";
import { UpdateService } from "../update.service";

@Component({
    selector: "acc-review-screen",
    imports: [
        MatDialogModule,
        ReviewerDraftCardComponent,
        ReviewerEditCardComponent,
        ReviewerUpdateCardComponent,
    ],
    templateUrl: "./review-screen.component.html",
    styleUrl: "./review-screen.component.scss",
})
export class ReviewScreenComponent implements OnInit {
    private dialog = inject(MatDialog);
    private draftService = inject(DraftService);
    private editService = inject(EditService);
    private snackbar = inject(MatSnackBar);
    private updateService = inject(UpdateService);

    drafts: Draft[] = [];
    edits: Edit[] = [];
    updates: Update[] = [];

    ngOnInit(): void {
        this.draftService.getAssigned().subscribe({
            next: (drafts) => (this.drafts = drafts),
            error: showApiErrorSnackbar(this.snackbar),
        });
        this.editService.getAssigned().subscribe({
            next: (edits) => (this.edits = edits),
            error: showApiErrorSnackbar(this.snackbar),
        });
        this.updateService.getAssigned().subscribe({
            next: (updates) => (this.updates = updates),
            error: showApiErrorSnackbar(this.snackbar),
        });
    }

    openDraftReviewDialog(draftId: string): void {
        this.dialog
            .open(ReviewDialogComponent)
            .afterClosed()
            .subscribe((review) => {
                if (review !== undefined) {
                    this.draftService.createReviewForDraft(draftId, review).subscribe({
                        next: () => {
                            // Remove draft card from the UI
                            const i = this.drafts.findIndex((d) => d.id === draftId);
                            if (i > -1) {
                                this.drafts.splice(i, 1);
                            }
                        },
                        error: showApiErrorSnackbar(this.snackbar),
                    });
                }
            });
    }

    openEditReviewDialog(editId: string): void {
        this.dialog
            .open(ReviewDialogComponent)
            .afterClosed()
            .subscribe((review) => {
                if (review !== undefined) {
                    this.editService.createReviewForEdit(editId, review).subscribe({
                        next: () => {
                            // Remove edit card from the UI
                            const i = this.edits.findIndex((e) => e.id === editId);
                            if (i > -1) {
                                this.edits.splice(i, 1);
                            }
                        },
                        error: showApiErrorSnackbar(this.snackbar),
                    });
                }
            });
    }

    openUpdateReviewDialog(updateId: string): void {
        this.dialog
            .open(ReviewDialogComponent)
            .afterClosed()
            .subscribe((review) => {
                if (review !== undefined) {
                    this.updateService.createReviewForUpdate(updateId, review).subscribe({
                        next: () => {
                            // Remove update card from the UI
                            const i = this.updates.findIndex((u) => u.id === updateId);
                            if (i > -1) {
                                this.updates.splice(i, 1);
                            }
                        },
                        error: showApiErrorSnackbar(this.snackbar),
                    });
                }
            });
    }
}
