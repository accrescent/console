// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Measures the length of a string in Unicode code points.
 *
 * @param value - the string to measure the length of.
 * @returns the length of the string in Unicode code points.
 */
export function codePointLength(value: string): number {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator
    return [...value].length;
}
