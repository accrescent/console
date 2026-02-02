// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, OnInit, inject } from '@angular/core';

import { AppService } from '../app.service';
import { Draft } from '../../draft';
import { DraftService } from '../draft.service';
import {
    PublisherDraftCardComponent,
} from '../publisher-draft-card/publisher-draft-card.component';

@Component({
    selector: 'acc-publish-screen',
    imports: [PublisherDraftCardComponent],
    templateUrl: './publish-screen.component.html',
    styleUrl: './publish-screen.component.scss'
})
export class PublishScreenComponent implements OnInit {
    private appService = inject(AppService);
    private draftService = inject(DraftService);

    drafts: Draft[] = [];

    ngOnInit(): void {
        this.draftService.getApproved().subscribe(drafts => this.drafts = drafts);
    }

    publishDraft(draftId: string): void {
        this.appService.publishDraft(draftId).subscribe(() => {
            // Remove the draft card from the UI
            const i = this.drafts.findIndex(d => d.id === draftId);
            if (i > -1) {
                this.drafts.splice(i, 1);
            }
        });
    }
}
