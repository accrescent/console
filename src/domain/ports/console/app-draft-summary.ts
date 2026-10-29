// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * A summary of an app draft.
 */
export interface AppDraftSummary {
    /**
     * The app draft's unique ID.
     */
    readonly id: string;

    /**
     * The app's name from the app draft's default listing, if set.
     */
    readonly name?: string;

    /**
     * The URL of the icon from the app draft's default listing, if set.
     */
    readonly iconUrl?: string;

    /**
     * A summary of the app draft's uploaded package, if available.
     */
    readonly package?: AppDraftPackageSummary;
}

/**
 * A summary of an app draft's uploaded package.
 */
export interface AppDraftPackageSummary {
    /**
     * The package's version name.
     */
    readonly versionName: string;

    /**
     * The package's Android application ID.
     */
    readonly androidApplicationId: string;
}
