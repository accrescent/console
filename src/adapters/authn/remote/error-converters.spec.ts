// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { toLogOutError } from "./error-converters";

describe("toLogOutError", () => {
    it("converts an unauthorized status to unauthenticated", () => {
        expect(toLogOutError(401)).toEqual({ kind: "unauthenticated" });
    });

    it("converts other statuses to unknown", () => {
        expect(toLogOutError(500)).toEqual({ kind: "unknown" });
    });
});
