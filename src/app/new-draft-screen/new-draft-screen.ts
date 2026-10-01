// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject, signal } from "@angular/core";
import { HttpEventType, HttpResponse } from "@angular/common/http";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { finalize } from "rxjs";

import { showApiErrorSnackbar } from "../api-error-handler";
import { DraftService } from "../draft.service";
import { DraftSubmissionDialog } from "../draft-submission-dialog/draft-submission-dialog";
import { NewDraftEditor } from "../new-draft-editor/new-draft-editor";
import type { NewDraftForm } from "../new-draft-form";

@Component({
    selector: "acc-new-draft-screen",
    imports: [MatDialogModule, MatProgressBarModule, NewDraftEditor],
    templateUrl: "./new-draft-screen.component.html",
})
export class NewDraftScreen {
    private dialog = inject(MatDialog);
    private draftService = inject(DraftService);
    private router = inject(Router);
    private snackbar = inject(MatSnackBar);

    readonly uploadProgress = signal<number | undefined>(undefined);
    readonly submitDisabled = signal(false);

    createDraft(form: NewDraftForm): void {
        this.submitDisabled.set(true);
        this.draftService
            .createDraft(form)
            .pipe(finalize(() => this.submitDisabled.set(false)))
            .subscribe({
                next: (event) => {
                    if (event.type === HttpEventType.UploadProgress) {
                        this.uploadProgress.set((100 * event.loaded) / event.total!);

                        // Clear the progress bar once the upload is complete
                        if (event.loaded === event.total!) {
                            this.uploadProgress.set(undefined);
                        }
                    } else if (event instanceof HttpResponse) {
                        const draft = event.body!;
                        this.dialog
                            .open(DraftSubmissionDialog, { data: draft })
                            .afterClosed()
                            .subscribe((confirmed) => {
                                if (confirmed) {
                                    this.draftService.submitDraft(draft.id).subscribe({
                                        next: () => this.router.navigate(["apps"]),
                                        error: showApiErrorSnackbar(this.snackbar),
                                    });
                                } else {
                                    this.router.navigate(["apps"]);
                                }
                            });
                    }
                },
                error: showApiErrorSnackbar(this.snackbar),
            });
    }
}
