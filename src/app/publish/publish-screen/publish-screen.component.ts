// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, OnInit, inject } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

import { showApiErrorSnackbar } from "../../api-error-handler";
import { AppService } from "../app.service";
import { Draft } from "../../draft";
import { DraftService } from "../draft.service";
import { PublisherDraftCardComponent } from "../publisher-draft-card/publisher-draft-card.component";

@Component({
    selector: "acc-publish-screen",
    imports: [PublisherDraftCardComponent],
    templateUrl: "./publish-screen.component.html",
    styleUrl: "./publish-screen.component.scss",
})
export class PublishScreenComponent implements OnInit {
    private appService = inject(AppService);
    private draftService = inject(DraftService);
    private snackbar = inject(MatSnackBar);

    drafts: Draft[] = [];

    ngOnInit(): void {
        this.draftService.getApproved().subscribe({
            next: (drafts) => (this.drafts = drafts),
            error: showApiErrorSnackbar(this.snackbar),
        });
    }

    publishDraft(draftId: string): void {
        this.appService.publishDraft(draftId).subscribe({
            next: () => {
                // Remove the draft card from the UI
                const i = this.drafts.findIndex((d) => d.id === draftId);
                if (i > -1) {
                    this.drafts.splice(i, 1);
                }
            },
            error: showApiErrorSnackbar(this.snackbar),
        });
    }
}
