// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, computed, input } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { RouterLink } from "@angular/router";

/**
 * A display for an error which applies to a whole page, usually because it prevents the page from
 * loading any of its content.
 */
@Component({
    imports: [MatButton, MatIcon, RouterLink],
    selector: "acc-full-page-error-view",
    host: { class: "m-auto flex max-w-sm flex-col items-center gap-6 text-center" },
    templateUrl: "./full-page-error-view.html",
})
export class FullPageErrorView {
    /**
     * The error to display.
     */
    readonly error = input.required<FullPageError>();

    /**
     * The icon and title shown above the error message.
     */
    protected readonly summary = computed(() => SUMMARIES[this.error().kind]);
}

const SUMMARIES = {
    unavailable: { icon: "error", title: "Something went wrong" },
    permissionDenied: { icon: "lock", title: "No access" },
} satisfies Record<FullPageError["kind"], { icon: string; title: string }>;

/**
 * An error which applies to a whole page.
 */
export type FullPageError = FullPageErrorUnavailable | FullPageErrorPermissionDenied;

/**
 * A resource couldn't be loaded for a reason outside the user's control.
 *
 * @typeParam R - the kind of resource that can be unavailable.
 */
export interface FullPageErrorUnavailable<R extends FullPageErrorResource = FullPageErrorResource> {
    readonly kind: "unavailable";

    /**
     * The resource which couldn't be loaded.
     */
    readonly resource: R;
}

/**
 * The user isn't allowed to view an organization.
 */
export interface FullPageErrorPermissionDenied {
    readonly kind: "permissionDenied";

    /**
     * The organization the user isn't allowed to view.
     */
    readonly resource: OrganizationResource;
}

/**
 * A resource that a {@link FullPageError} prevented from being shown.
 */
export type FullPageErrorResource = ConsoleResource | OrganizationResource;

/**
 * The console as a whole.
 */
export interface ConsoleResource {
    readonly kind: "console";
}

/**
 * An organization.
 */
export interface OrganizationResource {
    readonly kind: "organization";

    /**
     * The ID of the organization.
     */
    readonly id: string;
}
