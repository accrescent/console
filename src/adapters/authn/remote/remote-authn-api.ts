// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { AuthnApi } from "../../../domain/ports/authn/authn-api";

/**
 * An {@link AuthnApi} backed by the remote console API.
 */
export class RemoteAuthnApi implements AuthnApi {
    /**
     * @param document - the document to navigate when starting login flows
     */
    constructor(private readonly document: Document) {}

    logInWithGitHub(): void {
        this.document.location.assign("/auth/github/login");
    }
}
