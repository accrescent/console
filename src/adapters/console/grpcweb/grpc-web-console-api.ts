// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { UserService } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/user_service_pb.js";
import { type Client, createClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";

import { err, ok, type Result } from "../../../core/result";
import type { ConsoleApi } from "../../../domain/ports/console/console-api";
import type { GetSelfError } from "../../../domain/ports/console/errors";
import type { GetSelfResponse } from "../../../domain/ports/console/get-self-response";
import { toGetSelfError } from "./error-converters";
import { toGetSelfResponse } from "./message-converters";

/**
 * A {@link ConsoleApi} implementation which accesses the console API over gRPC-Web.
 */
export class GrpcWebConsoleApi implements ConsoleApi {
    private readonly userClient: Client<typeof UserService>;

    /**
     * @param baseUrl - the URL the console API is served from.
     * @param defaultTimeoutMs - the default timeout in milliseconds to apply to requests.
     */
    constructor(baseUrl: string, defaultTimeoutMs: number) {
        const transport = createGrpcWebTransport({ baseUrl, defaultTimeoutMs });

        this.userClient = createClient(UserService, transport);
    }

    async getSelf(): Promise<Result<GetSelfResponse, GetSelfError>> {
        try {
            return ok(toGetSelfResponse(await this.userClient.getSelf({})));
        } catch (e) {
            return err(toGetSelfError(e));
        }
    }
}
