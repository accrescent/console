// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { OrganizationService } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/organization_service_pb.js";
import { UserService } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/user_service_pb.js";
import { type Client, createClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";

import { err, ok, type Result } from "../../../core/result";
import type { ConsoleApi } from "../../../domain/ports/console/console-api";
import type {
    GetMyOrganizationError,
    GetOrganizationError,
    GetSelfError,
} from "../../../domain/ports/console/errors";
import type { GetMyOrganizationResponse } from "../../../domain/ports/console/get-my-organization-response";
import type { GetOrganizationRequest } from "../../../domain/ports/console/get-organization-request";
import type { GetOrganizationResponse } from "../../../domain/ports/console/get-organization-response";
import type { GetSelfResponse } from "../../../domain/ports/console/get-self-response";
import {
    toGetMyOrganizationError,
    toGetOrganizationError,
    toGetSelfError,
} from "./error-converters";
import {
    toGetMyOrganizationResponse,
    toGetOrganizationResponse,
    toGetSelfResponse,
} from "./message-converters";

/**
 * A {@link ConsoleApi} implementation which accesses the console API over gRPC-Web.
 */
export class GrpcWebConsoleApi implements ConsoleApi {
    private readonly organizationClient: Client<typeof OrganizationService>;
    private readonly userClient: Client<typeof UserService>;

    /**
     * @param baseUrl - the URL the console API is served from.
     * @param defaultTimeoutMs - the default timeout in milliseconds to apply to requests.
     */
    constructor(baseUrl: string, defaultTimeoutMs: number) {
        const transport = createGrpcWebTransport({ baseUrl, defaultTimeoutMs });

        this.organizationClient = createClient(OrganizationService, transport);
        this.userClient = createClient(UserService, transport);
    }

    async getSelf(): Promise<Result<GetSelfResponse, GetSelfError>> {
        try {
            return ok(toGetSelfResponse(await this.userClient.getSelf({})));
        } catch (e) {
            return err(toGetSelfError(e));
        }
    }

    async getOrganization(
        request: GetOrganizationRequest,
        signal?: AbortSignal,
    ): Promise<Result<GetOrganizationResponse, GetOrganizationError>> {
        try {
            const response = await this.organizationClient.getOrganization(
                { organizationId: request.organizationId },
                { signal },
            );
            return ok(toGetOrganizationResponse(response));
        } catch (e) {
            return err(toGetOrganizationError(e));
        }
    }

    async getMyOrganization(): Promise<Result<GetMyOrganizationResponse, GetMyOrganizationError>> {
        try {
            return ok(
                toGetMyOrganizationResponse(await this.organizationClient.getMyOrganization({})),
            );
        } catch (e) {
            return err(toGetMyOrganizationError(e));
        }
    }
}
