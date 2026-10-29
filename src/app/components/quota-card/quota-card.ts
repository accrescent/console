// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, computed, input } from "@angular/core";
import {
    MatCard,
    MatCardAvatar,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
} from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatProgressBar } from "@angular/material/progress-bar";

import { quotaLevel } from "../../../domain/quota";

/**
 * A card showing how much of a quota is used.
 */
@Component({
    imports: [
        MatCard,
        MatCardAvatar,
        MatCardContent,
        MatCardHeader,
        MatCardSubtitle,
        MatCardTitle,
        MatIcon,
        MatProgressBar,
    ],
    selector: "acc-quota-card",
    templateUrl: "./quota-card.html",
})
export class QuotaCard {
    /**
     * What the quota limits.
     */
    readonly label = input.required<string>();

    /**
     * A short explanation of what the quota counts.
     */
    readonly description = input.required<string>();

    /**
     * The name of the Material Symbol representing what the quota limits.
     */
    readonly icon = input.required<string>();

    /**
     * The amount of the quota used.
     */
    readonly count = input.required<number>();

    /**
     * The maximum amount of the quota allowed to be used.
     */
    readonly limit = input.required<number>();

    /**
     * The action recommended when the quota is full.
     */
    readonly fullAction = input.required<string>();

    protected readonly level = computed(() => quotaLevel(this.count(), this.limit()));
    protected readonly percentUsed = computed(() =>
        this.level() === "full" ? 100 : (this.count() / this.limit()) * 100,
    );
}
