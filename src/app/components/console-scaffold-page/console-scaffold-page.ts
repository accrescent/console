// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input, output } from "@angular/core";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from "@angular/material/list";
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from "@angular/material/sidenav";
import { MatToolbar } from "@angular/material/toolbar";
import { RouterLink, RouterLinkActive } from "@angular/router";

import accrescentLogo from "../../../assets/accrescent-logo.svg";
import { LoadingButton, type LoadingButtonState } from "../loading-button/loading-button";

/**
 * The scaffold for console pages, containing a toolbar and navigation sidebar.
 */
@Component({
    imports: [
        LoadingButton,
        MatIcon,
        MatIconButton,
        MatListItem,
        MatListItemIcon,
        MatListItemTitle,
        MatNavList,
        MatSidenav,
        MatSidenavContainer,
        MatSidenavContent,
        MatToolbar,
        RouterLink,
        RouterLinkActive,
    ],
    selector: "acc-console-scaffold-page",
    templateUrl: "./console-scaffold-page.html",
})
export class ConsoleScaffoldPage {
    protected readonly accrescentLogo = accrescentLogo;

    /**
     * Whether the screen is handset-sized. If false, the sidebar will always be open. If true, the
     * sidebar will default to closed and have a toggle to open it.
     */
    readonly handset = input.required<boolean>();

    /**
     * The state of logging out. While logout is in progress, the logout button is disabled and
     * doesn't emit {@link logOut} events.
     */
    readonly logoutState = input.required<LoadingButtonState>();

    /**
     * Emits when the user clicks the log out button.
     */
    readonly logOut = output<void>();
}
