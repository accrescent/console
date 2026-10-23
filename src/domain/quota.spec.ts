// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { quotaLevel } from "./quota";

describe("quotaLevel", () => {
    it("returns available when below the nearly full fraction", () => {
        expect(quotaLevel(0, 4)).toBe("available");
        expect(quotaLevel(2, 4)).toBe("available");
        expect(quotaLevel(1, 3)).toBe("available");
        expect(quotaLevel(44, 50)).toBe("available");
    });

    it("returns nearlyFull when at or above the nearly full fraction but below the limit", () => {
        expect(quotaLevel(9, 10)).toBe("nearlyFull");
        expect(quotaLevel(45, 50)).toBe("nearlyFull");
    });

    it("returns nearlyFull when only one remains", () => {
        expect(quotaLevel(0, 1)).toBe("nearlyFull");
        expect(quotaLevel(2, 3)).toBe("nearlyFull");
        expect(quotaLevel(3, 4)).toBe("nearlyFull");
    });

    it("returns full when at or above the limit", () => {
        expect(quotaLevel(4, 4)).toBe("full");
        expect(quotaLevel(5, 4)).toBe("full");
    });

    it("returns full when the limit is zero", () => {
        expect(quotaLevel(0, 0)).toBe("full");
    });
});
