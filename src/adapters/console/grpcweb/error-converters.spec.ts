// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Code, ConnectError } from "@connectrpc/connect";

import {
    toCreateAppDraftError,
    toGetMyOrganizationError,
    toGetOrganizationError,
    toGetSelfError,
} from "./error-converters";

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

describe("toGetMyOrganizationError", () => {
    it("converts known codes", () => {
        expect(toGetMyOrganizationError(new ConnectError("", Code.Unauthenticated))).toEqual({
            kind: "unauthenticated",
        });
        expect(toGetMyOrganizationError(new ConnectError("", Code.Internal))).toEqual({
            kind: "internal",
        });
        expect(toGetMyOrganizationError(new ConnectError("", Code.Unavailable))).toEqual({
            kind: "serviceUnavailable",
        });
    });

    it("converts other errors to unknown", () => {
        expect(toGetMyOrganizationError(new Error())).toEqual({ kind: "unknown" });
    });
});

describe("toGetOrganizationError", () => {
    it("converts known codes", () => {
        expect(toGetOrganizationError(new ConnectError("", Code.Unauthenticated))).toEqual({
            kind: "unauthenticated",
        });
        expect(toGetOrganizationError(new ConnectError("", Code.PermissionDenied))).toEqual({
            kind: "permissionDenied",
        });
        expect(toGetOrganizationError(new ConnectError("", Code.Internal))).toEqual({
            kind: "internal",
        });
        expect(toGetOrganizationError(new ConnectError("", Code.Unavailable))).toEqual({
            kind: "serviceUnavailable",
        });
    });

    it("converts other errors to unknown", () => {
        expect(toGetOrganizationError(new Error())).toEqual({ kind: "unknown" });
    });
});

describe("toCreateAppDraftError", () => {
    it("converts known codes", () => {
        expect(toCreateAppDraftError(new ConnectError("", Code.Unauthenticated))).toEqual({
            kind: "unauthenticated",
        });
        expect(toCreateAppDraftError(new ConnectError("", Code.PermissionDenied))).toEqual({
            kind: "permissionDenied",
        });
        expect(toCreateAppDraftError(new ConnectError("", Code.ResourceExhausted))).toEqual({
            kind: "resourceLimitExceeded",
        });
        expect(toCreateAppDraftError(new ConnectError("", Code.Internal))).toEqual({
            kind: "internal",
        });
        expect(toCreateAppDraftError(new ConnectError("", Code.Unavailable))).toEqual({
            kind: "serviceUnavailable",
        });
    });

    it("converts other errors to unknown", () => {
        expect(toCreateAppDraftError(new Error())).toEqual({ kind: "unknown" });
    });
});
