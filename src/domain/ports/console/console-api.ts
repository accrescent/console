// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { Result } from "../../../core/result";
import type { CreateAppDraftListingTextRequest } from "./create-app-draft-listing-text-request";
import type { CreateAppDraftListingTextResponse } from "./create-app-draft-listing-text-response";
import type { CreateAppDraftRequest } from "./create-app-draft-request";
import type { CreateAppDraftResponse } from "./create-app-draft-response";
import type { DeleteAppDraftRequest } from "./delete-app-draft-request";
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
} from "./errors";
import type { GetAppDraftDetailsRequest } from "./get-app-draft-details-request";
import type { GetAppDraftDetailsResponse } from "./get-app-draft-details-response";
import type { GetMyOrganizationResponse } from "./get-my-organization-response";
import type { GetOrganizationRequest } from "./get-organization-request";
import type { GetOrganizationResponse } from "./get-organization-response";
import type { GetSelfResponse } from "./get-self-response";
import type { ListAppDraftSummariesRequest } from "./list-app-draft-summaries-request";
import type { ListAppDraftSummariesResponse } from "./list-app-draft-summaries-response";
import type { UpdateAppDraftListingTextRequest } from "./update-app-draft-listing-text-request";
import type { UpdateAppDraftListingTextResponse } from "./update-app-draft-listing-text-response";

/**
 * The Accrescent console API.
 */
export interface ConsoleApi {
    /**
     * Creates an app draft.
     *
     * @param request - the parameters for creating the app draft.
     * @returns a response identifying the created app draft.
     */
    createAppDraft(
        request: CreateAppDraftRequest,
    ): Promise<Result<CreateAppDraftResponse, CreateAppDraftError>>;

    /**
     * Creates an app draft's listing text.
     *
     * @param request - the parameters for creating the listing text.
     * @returns a response containing the etag of the created listing text.
     */
    createAppDraftListingText(
        request: CreateAppDraftListingTextRequest,
    ): Promise<Result<CreateAppDraftListingTextResponse, CreateAppDraftListingTextError>>;

    /**
     * Deletes an app draft.
     *
     * @param request - the parameters for deleting the app draft.
     */
    deleteAppDraft(request: DeleteAppDraftRequest): Promise<Result<void, DeleteAppDraftError>>;

    /**
     * Gets an app draft's details.
     *
     * @param request - the parameters for getting the app draft's details.
     * @param signal - a signal which cancels the request when aborted.
     * @returns a response containing the app draft's details.
     */
    getAppDraftDetails(
        request: GetAppDraftDetailsRequest,
        signal?: AbortSignal,
    ): Promise<Result<GetAppDraftDetailsResponse, GetAppDraftDetailsError>>;

    /**
     * Gets an organization.
     *
     * @param request - the parameters for getting the organization.
     * @param signal - a signal which cancels the request when aborted.
     * @returns a response containing the requested organization.
     */
    getOrganization(
        request: GetOrganizationRequest,
        signal?: AbortSignal,
    ): Promise<Result<GetOrganizationResponse, GetOrganizationError>>;

    /**
     * Gets the organization owned by the currently authenticated user.
     *
     * @returns a response containing the currently authenticated user's organization.
     */
    getMyOrganization(): Promise<Result<GetMyOrganizationResponse, GetMyOrganizationError>>;

    /**
     * Gets the currently authenticated user.
     *
     * @returns a response containing the currently authenticated user.
     */
    getSelf(): Promise<Result<GetSelfResponse, GetSelfError>>;

    /**
     * Lists summaries of an organization's app drafts.
     *
     * @param request - the parameters for listing the app draft summaries.
     * @param signal - a signal which cancels the request when aborted.
     * @returns a response containing the organization's app draft summaries.
     */
    listAppDraftSummaries(
        request: ListAppDraftSummariesRequest,
        signal?: AbortSignal,
    ): Promise<Result<ListAppDraftSummariesResponse, ListAppDraftSummariesError>>;

    /**
     * Updates an app draft's listing text.
     *
     * @param request - the parameters for updating the listing text.
     * @returns a response containing the etag of the updated listing text.
     */
    updateAppDraftListingText(
        request: UpdateAppDraftListingTextRequest,
    ): Promise<Result<UpdateAppDraftListingTextResponse, UpdateAppDraftListingTextError>>;
}
