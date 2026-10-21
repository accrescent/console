// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Code, ConnectError } from "@connectrpc/connect";

import type { GetSelfError } from "../../../domain/ports/console/errors";

export function toGetSelfError(e: unknown): GetSelfError {
    switch (ConnectError.from(e).code) {
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
