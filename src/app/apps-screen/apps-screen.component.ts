// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, OnInit, inject, signal } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RouterLink } from "@angular/router";

import { App } from "../app";
import { showApiErrorSnackbar } from "../api-error-handler";
import { AppCardComponent } from "../app-card/app-card.component";
import { AppService } from "../app.service";
import { Draft, DraftStatus } from "../draft";
import { DraftCardComponent } from "../draft-card/draft-card.component";
import { DraftDeletionDialogComponent } from "../draft-deletion-dialog/draft-deletion-dialog.component";
import { DraftService } from "../draft.service";

@Component({
    selector: "acc-apps-screen",
    imports: [
        AppCardComponent,
        DraftCardComponent,
        MatCardModule,
        MatDialogModule,
        MatDividerModule,
        RouterLink,
    ],
    templateUrl: "./apps-screen.component.html",
    styleUrl: "./apps-screen.component.scss",
})
export class AppsScreenComponent implements OnInit {
    private appService = inject(AppService);
    private dialog = inject(MatDialog);
    private draftService = inject(DraftService);
    private snackbar = inject(MatSnackBar);

    readonly apps = signal<App[]>([]);
    readonly drafts = signal<Draft[]>([]);

    ngOnInit(): void {
        this.appService.getApps().subscribe({
            next: (apps) => this.apps.set(apps),
            error: showApiErrorSnackbar(this.snackbar),
        });
        this.draftService.getDrafts().subscribe({
            next: (drafts) => this.drafts.set(drafts),
            error: showApiErrorSnackbar(this.snackbar),
        });
    }

    deleteDraft(id: string): void {
        const draft = this.drafts().find((d) => d.id === id);

        this.dialog
            .open(DraftDeletionDialogComponent, { data: draft })
            .afterClosed()
            .subscribe((confirmed) => {
                if (confirmed) {
                    this.draftService.deleteDraft(id).subscribe({
                        next: () => {
                            // Remove from the UI
                            this.drafts.update((drafts) => drafts.filter((d) => d.id !== id));
                        },
                        error: showApiErrorSnackbar(this.snackbar),
                    });
                }
            });
    }

    submitDraft(id: string): void {
        this.draftService.submitDraft(id).subscribe({
            next: () => {
                // Mark as submitted in the UI
                this.drafts.update((drafts) =>
                    drafts.map((draft) =>
                        draft.id === id && draft.status === DraftStatus.Unsubmitted
                            ? { ...draft, status: DraftStatus.Submitted }
                            : draft,
                    ),
                );
            },
            error: showApiErrorSnackbar(this.snackbar),
        });
    }
}
