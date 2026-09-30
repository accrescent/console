// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, OnInit, inject, signal } from "@angular/core";
import { HttpEventType, HttpResponse } from "@angular/common/http";
import { MatChipsModule } from "@angular/material/chips";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { finalize } from "rxjs";

import { AppInfo } from "../app-info";
import { showApiErrorSnackbar } from "../api-error-handler";
import { AppService } from "../app.service";
import { Edit, EditStatus } from "../edit";
import { EditCard } from "../edit-card/edit-card";
import { EditDeletionDialog } from "../edit-deletion-dialog/edit-deletion-dialog";
import { EditFilterPipe } from "../edit-filter.pipe";
import { EditService } from "../edit.service";
import { EditSubmissionDialog } from "../edit-submission-dialog/edit-submission-dialog";
import { NewEditEditor } from "../new-edit-editor/new-edit-editor";
import { NewEditForm } from "../new-edit-form";
import { NewUpdateEditor } from "../new-update-editor/new-update-editor";
import { NewUpdateForm } from "../new-update-form";
import { Update, UpdateStatus } from "../update";
import { UpdateCard } from "../update-card/update-card";
import { UpdateFilterPipe } from "../update-filter.pipe";
import { UpdateService } from "../update.service";
import { UpdateDeletionDialog } from "../update-deletion-dialog/update-deletion-dialog";
import { UpdateSubmissionDialog } from "../update-submission-dialog/update-submission-dialog";

@Component({
    selector: "acc-app-details-screen",
    imports: [
        EditCard,
        EditFilterPipe,
        MatChipsModule,
        MatDialogModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressBarModule,
        NewEditEditor,
        NewUpdateEditor,
        UpdateCard,
        UpdateFilterPipe,
    ],
    templateUrl: "./app-details-screen.component.html",
    styleUrl: "./app-details-screen.scss",
})
export class AppDetailsScreen implements OnInit {
    private activatedRoute = inject(ActivatedRoute);
    private appService = inject(AppService);
    private dialog = inject(MatDialog);
    private editService = inject(EditService);
    private router = inject(Router);
    private snackbar = inject(MatSnackBar);
    private updateService = inject(UpdateService);

    readonly app = signal<AppInfo | undefined>(undefined);
    readonly updates = signal<Update[]>([]);
    readonly edits = signal<Edit[]>([]);
    readonly uploadProgress = signal<number | undefined>(undefined);

    readonly showRejectedEdits = signal(false);
    readonly showPublishedEdits = signal(false);
    readonly showRejectedUpdates = signal(false);
    readonly showPublishedUpdates = signal(false);
    readonly submitDisabled = signal(false);

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe((params) => {
            // TODO: Handle error case
            const appId = params.get("id");
            if (appId !== null) {
                this.appService.getApp(appId).subscribe({
                    next: (app) => this.app.set(app),
                    error: showApiErrorSnackbar(this.snackbar),
                });
                this.editService.getEdits(appId).subscribe({
                    next: (edits) => this.edits.set(edits),
                    error: showApiErrorSnackbar(this.snackbar),
                });
                this.updateService.getUpdates(appId).subscribe({
                    next: (updates) => this.updates.set(updates),
                    error: showApiErrorSnackbar(this.snackbar),
                });
            }
        });
    }

    createUpdate(form: NewUpdateForm): void {
        const app = this.app();
        if (app !== undefined) {
            this.submitDisabled.set(true);
            this.updateService
                .createUpdate(app.id, form)
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
                            const update = event.body!;

                            this.updates.update((updates) => [...updates, update]);
                            this.dialog
                                .open(UpdateSubmissionDialog, {
                                    data: { app, update },
                                })
                                .afterClosed()
                                .subscribe((confirmed) => {
                                    if (confirmed) {
                                        this.submitUpdate(update.id);
                                    }
                                });
                        }
                    },
                    error: showApiErrorSnackbar(this.snackbar),
                });
        }
    }

    submitUpdate(id: string): void {
        this.updateService.submitUpdate(id).subscribe({
            next: (submittedUpdate) => {
                // Mark as submitted in the UI
                this.updates.update((updates) =>
                    updates.map((update) =>
                        update.id === id && update.status === UpdateStatus.Unsubmitted
                            ? { ...update, status: submittedUpdate.status }
                            : update,
                    ),
                );
            },
            error: showApiErrorSnackbar(this.snackbar),
        });
    }

    deleteUpdate(id: string): void {
        const update = this.updates().find((update) => update.id === id);

        this.dialog
            .open(UpdateDeletionDialog, { data: update })
            .afterClosed()
            .subscribe((confirmed) => {
                if (confirmed) {
                    this.updateService.deleteUpdate(id).subscribe({
                        next: () => {
                            // Remove update from the UI
                            this.updates.update((updates) =>
                                updates.filter((update) => update.id !== id),
                            );
                        },
                        error: showApiErrorSnackbar(this.snackbar),
                    });
                }
            });
    }

    createEdit(form: NewEditForm): void {
        const app = this.app();
        if (app !== undefined) {
            this.editService.createEdit(app.id, form).subscribe({
                next: (event) => {
                    if (event instanceof HttpResponse) {
                        const edit = event.body!;

                        this.edits.update((edits) => [...edits, edit]);
                        this.dialog
                            .open(EditSubmissionDialog, {
                                data: { app, edit },
                            })
                            .afterClosed()
                            .subscribe((confirmed) => {
                                if (confirmed) {
                                    this.submitEdit(edit.id);
                                }
                            });
                    }
                },
                error: showApiErrorSnackbar(this.snackbar),
            });
        }
    }

    submitEdit(id: string): void {
        this.editService.submitEdit(id).subscribe({
            next: () => {
                // Mark as submitted in the UI
                this.edits.update((edits) =>
                    edits.map((edit) =>
                        edit.id === id && edit.status === EditStatus.Unsubmitted
                            ? { ...edit, status: EditStatus.Submitted }
                            : edit,
                    ),
                );
            },
            error: showApiErrorSnackbar(this.snackbar),
        });
    }

    deleteEdit(id: string): void {
        const edit = this.edits().find((edit) => edit.id === id);

        this.dialog
            .open(EditDeletionDialog, { data: edit })
            .afterClosed()
            .subscribe((confirmed) => {
                if (confirmed) {
                    this.editService.deleteEdit(id).subscribe({
                        next: () => {
                            // Remove edit from the UI
                            this.edits.update((edits) => edits.filter((edit) => edit.id !== id));
                        },
                        error: showApiErrorSnackbar(this.snackbar),
                    });
                }
            });
    }
}
