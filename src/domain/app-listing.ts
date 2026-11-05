// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * The languages listings can be written in as BCP 47 tags.
 */
export const LISTING_LANGUAGES: readonly string[] = ["en-US"];

/**
 * The maximum length of a listing's app name in Unicode code points.
 */
export const LISTING_NAME_MAX_LENGTH = 30;

/**
 * The maximum length of a listing's short description in Unicode code points.
 */
export const LISTING_SHORT_DESCRIPTION_MAX_LENGTH = 80;

/**
 * The text of an app's listing.
 */
export interface AppListingText {
    /**
     * The proper name of the app.
     */
    readonly name: string;

    /**
     * A short description of the app.
     */
    readonly shortDescription: string;
}

const languageNames = new Intl.DisplayNames(["en-US"], {
    type: "language",
    languageDisplay: "standard",
});

/**
 * Names a listing language for display.
 *
 * @param language - the BCP 47 tag of the language.
 * @returns the English name of the language, e.g., "English (United States)" for "en-US".
 */
export function listingLanguageName(language: string): string {
    return languageNames.of(language) ?? language;
}
