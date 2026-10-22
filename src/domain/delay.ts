// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * The minimum number of milliseconds for operations to take.
 */
export const DELAY_MS = 500;

/**
 * Waits for a promise to settle, taking at least {@link DELAY_MS} milliseconds.
 *
 * This utility is useful for keeping progress indicators visible long enough for the user to see
 * them even when operations complete quickly, preventing animation flashes that cause poor UX.
 *
 * @param promise - the promise to wait for
 * @returns the value the promise resolves to
 */
export async function withDelay<T>(promise: Promise<T>): Promise<T> {
    const [result] = await Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, DELAY_MS)),
    ]);
    return result;
}
