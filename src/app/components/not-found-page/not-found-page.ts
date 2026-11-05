// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { RouterLink } from "@angular/router";

import accrescentLogo from "../../../assets/accrescent-logo.svg";
import { Page } from "../page/page";

/**
 * The fallback "not found" page.
 */
@Component({
    imports: [MatButton, Page, RouterLink],
    selector: "acc-not-found-page",
    templateUrl: "./not-found-page.html",
})
export class NotFoundPage {
    protected readonly accrescentLogo = accrescentLogo;
}
