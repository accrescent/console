// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { MIN_PROGRESS_MS, PROGRESS_DELAY_MS, withDeferredProgress } from "./delay";

describe("withDeferredProgress", () => {
    let progressShown: boolean;
    let settled: boolean;

    beforeEach(() => {
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
        progressShown = false;
        settled = false;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    /**
     * Calls {@link withDeferredProgress} with a promise that resolves after the given duration.
     */
    function waitFor(ms: number): Promise<string> {
        const promise = new Promise<string>((resolve) => setTimeout(() => resolve("value"), ms));
        return withDeferredProgress(promise, () => (progressShown = true)).finally(
            () => (settled = true),
        );
    }

    it("settles without showing progress when the promise settles quickly", async () => {
        const result = waitFor(PROGRESS_DELAY_MS - 1);

        await vi.advanceTimersByTimeAsync(PROGRESS_DELAY_MS - 1);

        expect(settled).toBe(true);
        expect(progressShown).toBe(false);
        await expect(result).resolves.toBe("value");
    });

    it("rejects without showing progress when the promise rejects quickly", async () => {
        const result = withDeferredProgress(
            Promise.reject(new Error("failed")),
            () => (progressShown = true),
        );

        await expect(result).rejects.toThrow("failed");
        expect(progressShown).toBe(false);
    });

    it("shows progress for the minimum duration when the promise settles slowly", async () => {
        const result = waitFor(PROGRESS_DELAY_MS + 1);

        await vi.advanceTimersByTimeAsync(PROGRESS_DELAY_MS - 1);
        expect(progressShown).toBe(false);

        await vi.advanceTimersByTimeAsync(1);
        expect(progressShown).toBe(true);

        await vi.advanceTimersByTimeAsync(MIN_PROGRESS_MS - 1);
        expect(settled).toBe(false);

        await vi.advanceTimersByTimeAsync(1);
        expect(settled).toBe(true);
        await expect(result).resolves.toBe("value");
    });

    it("waits for the promise when it settles after the minimum progress duration", async () => {
        const duration = PROGRESS_DELAY_MS + MIN_PROGRESS_MS * 2;
        const result = waitFor(duration);

        await vi.advanceTimersByTimeAsync(duration - 1);
        expect(progressShown).toBe(true);
        expect(settled).toBe(false);

        await vi.advanceTimersByTimeAsync(1);
        expect(settled).toBe(true);
        await expect(result).resolves.toBe("value");
    });
});
