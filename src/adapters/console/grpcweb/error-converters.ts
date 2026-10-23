// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Code, ConnectError } from "@connectrpc/connect";

import type {
    GetMyOrganizationError,
    GetOrganizationError,
    GetSelfError,
    InternalError,
    ServiceUnavailableError,
    UnauthenticatedError,
    UnknownError,
} from "../../../domain/ports/console/errors";

export function toGetMyOrganizationError(e: unknown): GetMyOrganizationError {
    return toCommonError(ConnectError.from(e).code);
}

export function toGetOrganizationError(e: unknown): GetOrganizationError {
    const code = ConnectError.from(e).code;
    return code === Code.PermissionDenied ? { kind: "permissionDenied" } : toCommonError(code);
}

export function toGetSelfError(e: unknown): GetSelfError {
    return toCommonError(ConnectError.from(e).code);
}

function toCommonError(
    code: Code,
): UnauthenticatedError | InternalError | ServiceUnavailableError | UnknownError {
    switch (code) {
        case Code.Unauthenticated:
            return { kind: "unauthenticated" };
        case Code.Internal:
            return { kind: "internal" };
        case Code.Unavailable:
            return { kind: "serviceUnavailable" };
        default:
            return { kind: "unknown" };
    }
}
