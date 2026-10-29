// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input } from "@angular/core";
import { MatRipple } from "@angular/material/core";
import { MatIcon } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import type { AppDraftSummary } from "../../../domain/ports/console/app-draft-summary";

/**
 * A list of an organization's app drafts each linking to its corresponding editor.
 */
@Component({
    imports: [MatIcon, MatRipple, RouterLink],
    selector: "acc-app-draft-list",
    templateUrl: "./app-draft-list.html",
})
export class AppDraftList {
    /**
     * The ID of the organization the app drafts belong to.
     */
    readonly orgId = input.required<string>();

    /**
     * Summaries of the app drafts to show.
     */
    readonly appDrafts = input.required<readonly AppDraftSummary[]>();
}
