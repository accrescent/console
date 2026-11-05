// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { codePointLength } from "./code-points";

describe("codePointLength", () => {
    it("counts each character in the Basic Multilingual Plane once", () => {
        expect(codePointLength("Weather")).toBe(7);
    });

    it("counts a surrogate pair once", () => {
        expect(codePointLength("😀")).toBe(1);
    });

    it("counts each code point in a grapheme cluster", () => {
        expect(codePointLength("é")).toBe(2);
    });

    it("counts empty text as zero", () => {
        expect(codePointLength("")).toBe(0);
    });
});
