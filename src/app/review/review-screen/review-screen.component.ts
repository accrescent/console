// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, OnInit, inject, signal } from "@angular/core";
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

    readonly drafts = signal<Draft[]>([]);
    readonly edits = signal<Edit[]>([]);
    readonly updates = signal<Update[]>([]);

    ngOnInit(): void {
        this.draftService.getAssigned().subscribe({
            next: (drafts) => this.drafts.set(drafts),
            error: showApiErrorSnackbar(this.snackbar),
        });
        this.editService.getAssigned().subscribe({
            next: (edits) => this.edits.set(edits),
            error: showApiErrorSnackbar(this.snackbar),
        });
        this.updateService.getAssigned().subscribe({
            next: (updates) => this.updates.set(updates),
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
                            this.drafts.update((drafts) => drafts.filter((d) => d.id !== draftId));
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
                            this.edits.update((edits) => edits.filter((e) => e.id !== editId));
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
                            this.updates.update((updates) =>
                                updates.filter((u) => u.id !== updateId),
                            );
                        },
                        error: showApiErrorSnackbar(this.snackbar),
                    });
                }
            });
    }
}
