// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, computed, input, output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";

import { Draft } from "../../draft";
import { environment } from "../../../environments/environment";

@Component({
    selector: "acc-reviewer-draft-card",
    imports: [MatButtonModule, MatCardModule],
    templateUrl: "./reviewer-draft-card.component.html",
})
export class ReviewerDraftCardComponent {
    readonly draft = input.required<Draft>();
    readonly postReview = output<string>();
    readonly apkSetLink = computed(
        () => `${environment.developerApiUrl}/api/v1/drafts/${this.draft().id}/apkset`,
    );

    onPostReview(): void {
        this.postReview.emit(this.draft().id);
    }
}
