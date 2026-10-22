// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { LogOutError } from "../../../domain/ports/authn/errors";

const HTTP_STATUS_UNAUTHORIZED = 401;

export function toLogOutError(status: number): LogOutError {
    switch (status) {
        case HTTP_STATUS_UNAUTHORIZED:
            return { kind: "unauthenticated" };
        default:
            return { kind: "unknown" };
    }
}
