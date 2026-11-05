// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { listingLanguageName } from "./app-listing";

describe("listingLanguageName", () => {
    it("names en-US correctly", () => {
        expect(listingLanguageName("en-US")).toBe("English (United States)");
    });
});
