// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * The number of milliseconds an operation must take before showing progress for it.
 */
export const PROGRESS_DELAY_MS = 200;

/**
 * The minimum number of milliseconds to show progress for once it's shown.
 */
export const MIN_PROGRESS_MS = 400;

/**
 * Shows progress for a promise in a user-friendly way.
 *
 * Progress is shown only if the promise takes more than {@link PROGRESS_DELAY_MS} to complete. If
 * progress is shown, it is shown for at least {@link MIN_PROGRESS_MS}. These two behaviors combined
 * make for a high-quality UX when used to display loading indicators in a UI because:
 *
 * - Fast operations result in fast loads without users needing to wait for a progress indicator to
 *   animate
 * - Progress indicators never appear for only a brief moment, causing an alarming or confusing
 *   animation "flash"
 *
 * @param promise - the promise to wait for.
 * @param showProgress - a callback invoked if the promise takes more than {@link PROGRESS_DELAY_MS}
 * to complete.
 * @returns the value the promise resolves to.
 */
export async function withDeferredProgress<T>(
    promise: Promise<T>,
    showProgress: () => void,
): Promise<T> {
    let minProgress: Promise<void> | undefined;
    const timer = setTimeout(() => {
        showProgress();
        minProgress = sleep(MIN_PROGRESS_MS);
    }, PROGRESS_DELAY_MS);

    try {
        return await promise;
    } finally {
        clearTimeout(timer);
        await minProgress;
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
