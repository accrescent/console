// Copyright 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { DraftService } from '../draft.service';
import {
    DraftSubmissionDialogComponent,
} from '../draft-submission-dialog/draft-submission-dialog.component';
import { NewDraftEditorComponent } from '../new-draft-editor/new-draft-editor.component';
import { NewDraftForm } from '../new-draft-form';

@Component({
    selector: 'acc-new-draft-screen',
    imports: [MatDialogModule, MatProgressBarModule, NewDraftEditorComponent],
    templateUrl: './new-draft-screen.component.html',
})
export class NewDraftScreenComponent {
    private dialog = inject(MatDialog);
    private draftService = inject(DraftService);
    private router = inject(Router);

    uploadProgress?: number = undefined;
    submitDisabled = false;

    createDraft(form: NewDraftForm): void {
        this.submitDisabled = true;
        this.draftService
            .createDraft(form)
            .pipe(finalize(() => this.submitDisabled = false))
            .subscribe(event => {
                if (event.type === HttpEventType.UploadProgress) {
                    this.uploadProgress = 100 * event.loaded / event.total!;

                    // Clear the progress bar once the upload is complete
                    if (event.loaded === event.total!) {
                        this.uploadProgress = undefined;
                    }
                } else if (event instanceof HttpResponse) {
                    const draft = event.body!;
                    this.dialog
                        .open(DraftSubmissionDialogComponent, { data: draft })
                        .afterClosed()
                        .subscribe(confirmed => {
                            if (confirmed) {
                                this.draftService.submitDraft(draft.id).subscribe(() => {
                                    this.router.navigate(['apps']);
                                });
                            } else {
                                this.router.navigate(['apps']);
                            }
                        });
                }
            });
    }
}
