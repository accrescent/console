// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { AppDraftService } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/app_draft_service_pb.js";
import { OrganizationService } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/organization_service_pb.js";
import { UserService } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/user_service_pb.js";
import { type Client, createClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";

import { err, ok, type Result } from "../../../core/result";
import type { ConsoleApi } from "../../../domain/ports/console/console-api";
import type { CreateAppDraftListingTextRequest } from "../../../domain/ports/console/create-app-draft-listing-text-request";
import type { CreateAppDraftListingTextResponse } from "../../../domain/ports/console/create-app-draft-listing-text-response";
import type { CreateAppDraftRequest } from "../../../domain/ports/console/create-app-draft-request";
import type { CreateAppDraftResponse } from "../../../domain/ports/console/create-app-draft-response";
import type { DeleteAppDraftRequest } from "../../../domain/ports/console/delete-app-draft-request";
import type {
    CreateAppDraftError,
    CreateAppDraftListingTextError,
    DeleteAppDraftError,
    GetAppDraftDetailsError,
    GetMyOrganizationError,
    GetOrganizationError,
    GetSelfError,
    ListAppDraftSummariesError,
    UpdateAppDraftListingTextError,
} from "../../../domain/ports/console/errors";
import type { GetAppDraftDetailsRequest } from "../../../domain/ports/console/get-app-draft-details-request";
import type { GetAppDraftDetailsResponse } from "../../../domain/ports/console/get-app-draft-details-response";
import type { GetMyOrganizationResponse } from "../../../domain/ports/console/get-my-organization-response";
import type { GetOrganizationRequest } from "../../../domain/ports/console/get-organization-request";
import type { GetOrganizationResponse } from "../../../domain/ports/console/get-organization-response";
import type { GetSelfResponse } from "../../../domain/ports/console/get-self-response";
import type { ListAppDraftSummariesRequest } from "../../../domain/ports/console/list-app-draft-summaries-request";
import type { ListAppDraftSummariesResponse } from "../../../domain/ports/console/list-app-draft-summaries-response";
import type { UpdateAppDraftListingTextRequest } from "../../../domain/ports/console/update-app-draft-listing-text-request";
import type { UpdateAppDraftListingTextResponse } from "../../../domain/ports/console/update-app-draft-listing-text-response";
import {
    toCreateAppDraftError,
    toCreateAppDraftListingTextError,
    toDeleteAppDraftError,
    toGetAppDraftDetailsError,
    toGetMyOrganizationError,
    toGetOrganizationError,
    toGetSelfError,
    toListAppDraftSummariesError,
    toUpdateAppDraftListingTextError,
} from "./error-converters";
import {
    toCreateAppDraftListingTextResponse,
    toCreateAppDraftResponse,
    toGetAppDraftDetailsResponse,
    toGetMyOrganizationResponse,
    toGetOrganizationResponse,
    toGetSelfResponse,
    toListAppDraftSummariesResponse,
    toUpdateAppDraftListingTextResponse,
} from "./message-converters";

/**
 * A {@link ConsoleApi} implementation which accesses the console API over gRPC-Web.
 */
export class GrpcWebConsoleApi implements ConsoleApi {
    private readonly appDraftClient: Client<typeof AppDraftService>;
    private readonly organizationClient: Client<typeof OrganizationService>;
    private readonly userClient: Client<typeof UserService>;

    /**
     * @param baseUrl - the URL the console API is served from.
     * @param defaultTimeoutMs - the default timeout in milliseconds to apply to requests.
     */
    constructor(baseUrl: string, defaultTimeoutMs: number) {
        const transport = createGrpcWebTransport({ baseUrl, defaultTimeoutMs });

        this.appDraftClient = createClient(AppDraftService, transport);
        this.organizationClient = createClient(OrganizationService, transport);
        this.userClient = createClient(UserService, transport);
    }

    async createAppDraft(
        request: CreateAppDraftRequest,
    ): Promise<Result<CreateAppDraftResponse, CreateAppDraftError>> {
        try {
            const response = await this.appDraftClient.createAppDraft({
                organizationId: request.organizationId,
            });
            return ok(toCreateAppDraftResponse(response));
        } catch (e) {
            return err(toCreateAppDraftError(e));
        }
    }

    async createAppDraftListingText(
        request: CreateAppDraftListingTextRequest,
    ): Promise<Result<CreateAppDraftListingTextResponse, CreateAppDraftListingTextError>> {
        try {
            const response = await this.appDraftClient.createAppDraftListingText({
                appDraftId: request.appDraftId,
                name: request.name,
                shortDescription: request.shortDescription,
            });
            return ok(toCreateAppDraftListingTextResponse(response));
        } catch (e) {
            return err(toCreateAppDraftListingTextError(e));
        }
    }

    async deleteAppDraft(
        request: DeleteAppDraftRequest,
    ): Promise<Result<void, DeleteAppDraftError>> {
        try {
            await this.appDraftClient.deleteAppDraft({ appDraftId: request.appDraftId });
            return ok(undefined);
        } catch (e) {
            return err(toDeleteAppDraftError(e));
        }
    }

    async getAppDraftDetails(
        request: GetAppDraftDetailsRequest,
        signal?: AbortSignal,
    ): Promise<Result<GetAppDraftDetailsResponse, GetAppDraftDetailsError>> {
        try {
            const response = await this.appDraftClient.getAppDraftDetails(
                { appDraftId: request.appDraftId },
                { signal },
            );
            return ok(toGetAppDraftDetailsResponse(response));
        } catch (e) {
            return err(toGetAppDraftDetailsError(e));
        }
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

    async listAppDraftSummaries(
        request: ListAppDraftSummariesRequest,
        signal?: AbortSignal,
    ): Promise<Result<ListAppDraftSummariesResponse, ListAppDraftSummariesError>> {
        try {
            const response = await this.appDraftClient.listAppDraftSummaries(
                { organizationId: request.organizationId },
                { signal },
            );
            return ok(toListAppDraftSummariesResponse(response));
        } catch (e) {
            return err(toListAppDraftSummariesError(e));
        }
    }

    async updateAppDraftListingText(
        request: UpdateAppDraftListingTextRequest,
    ): Promise<Result<UpdateAppDraftListingTextResponse, UpdateAppDraftListingTextError>> {
        try {
            const response = await this.appDraftClient.updateAppDraftListingText({
                appDraftId: request.appDraftId,
                etag: request.etag,
                name: request.name,
                shortDescription: request.shortDescription,
                updateMask: { paths: ["name", "short_description"] },
            });
            return ok(toUpdateAppDraftListingTextResponse(response));
        } catch (e) {
            return err(toUpdateAppDraftListingTextError(e));
        }
    }
}
