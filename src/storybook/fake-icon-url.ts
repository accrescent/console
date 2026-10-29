// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Creates a data URL for a placeholder app icon with the given colors.
 */
export function fakeIconUrl(background: string, foreground: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${background}"/><circle cx="256" cy="256" r="128" fill="${foreground}"/></svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
