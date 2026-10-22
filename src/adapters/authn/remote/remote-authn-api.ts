// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { err, ok, type Result } from "../../../core/result";
import type { AuthnApi } from "../../../domain/ports/authn/authn-api";
import type { LogOutError } from "../../../domain/ports/authn/errors";
import { toLogOutError } from "./error-converters";

const SESSION_PATH = "/auth/session";

/**
 * An {@link AuthnApi} backed by the remote console API.
 */
export class RemoteAuthnApi implements AuthnApi {
    /**
     * @param document - the document to navigate when starting login flows
     * @param defaultTimeoutMs - the default timeout in milliseconds to apply to requests
     */
    constructor(
        private readonly document: Document,
        private readonly defaultTimeoutMs: number,
    ) {}

    logInWithGitHub(): void {
        this.document.location.assign("/auth/github/login");
    }

    async logOut(): Promise<Result<void, LogOutError>> {
        let response;
        try {
            response = await fetch(SESSION_PATH, {
                method: "DELETE",
                signal: AbortSignal.timeout(this.defaultTimeoutMs),
            });
        } catch {
            return err({ kind: "unknown" });
        }

        if (!response.ok) {
            return err(toLogOutError(response.status));
        }

        return ok(undefined);
    }
}
