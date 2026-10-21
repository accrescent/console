// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Code, ConnectError } from "@connectrpc/connect";

import { toGetSelfError } from "./error-converters";

describe("toGetSelfError", () => {
    it("converts known codes", () => {
        expect(toGetSelfError(new ConnectError("", Code.Unauthenticated))).toEqual({
            kind: "unauthenticated",
        });
        expect(toGetSelfError(new ConnectError("", Code.Internal))).toEqual({ kind: "internal" });
        expect(toGetSelfError(new ConnectError("", Code.Unavailable))).toEqual({
            kind: "serviceUnavailable",
        });
    });

    it("converts other errors to unknown", () => {
        expect(toGetSelfError(new Error())).toEqual({ kind: "unknown" });
    });
});
