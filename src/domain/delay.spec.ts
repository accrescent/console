// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { DELAY_MS, withDelay } from "./delay";

describe("withDelay", () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("waits for the minimum duration when the promise resolves sooner", async () => {
        let settled = false;
        const result = withDelay(Promise.resolve("value")).then((value) => {
            settled = true;
            return value;
        });

        await vi.advanceTimersByTimeAsync(DELAY_MS - 1);
        expect(settled).toBe(false);

        await vi.advanceTimersByTimeAsync(1);
        expect(settled).toBe(true);
        await expect(result).resolves.toBe("value");
    });

    it("waits for the promise when it resolves after the minimum duration", async () => {
        let settled = false;
        const slow = new Promise<string>((resolve) =>
            setTimeout(() => resolve("value"), DELAY_MS * 2),
        );
        const result = withDelay(slow).then((value) => {
            settled = true;
            return value;
        });

        await vi.advanceTimersByTimeAsync(DELAY_MS * 2 - 1);
        expect(settled).toBe(false);

        await vi.advanceTimersByTimeAsync(1);
        expect(settled).toBe(true);
        await expect(result).resolves.toBe("value");
    });
});
