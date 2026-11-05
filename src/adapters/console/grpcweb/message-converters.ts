// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { AppDraftListingText as ProtoAppDraftListingText } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/app_draft_listing_text_pb.js";
import type { AppDraftSummary as ProtoAppDraftSummary } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/app_draft_summary_pb.js";
import type { CreateAppDraftListingTextResponse as ProtoCreateAppDraftListingTextResponse } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/create_app_draft_listing_text_response_pb.js";
import type { CreateAppDraftResponse as ProtoCreateAppDraftResponse } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/create_app_draft_response_pb.js";
import type { GetAppDraftDetailsResponse as ProtoGetAppDraftDetailsResponse } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/get_app_draft_details_response_pb.js";
import type { GetMyOrganizationResponse as ProtoGetMyOrganizationResponse } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/get_my_organization_response_pb.js";
import type { GetOrganizationResponse as ProtoGetOrganizationResponse } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/get_organization_response_pb.js";
import type { GetSelfResponse as ProtoGetSelfResponse } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/get_self_response_pb.js";
import type { ListAppDraftSummariesResponse as ProtoListAppDraftSummariesResponse } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/list_app_draft_summaries_response_pb.js";
import {
    type Organization as ProtoOrganization,
    OrganizationSchema,
} from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/organization_pb.js";
import type { UpdateAppDraftListingTextResponse as ProtoUpdateAppDraftListingTextResponse } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/update_app_draft_listing_text_response_pb.js";
import {
    type User as ProtoUser,
    UserSchema,
} from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/user_pb.js";
import { UserRole as ProtoUserRole } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/user_role_pb.js";
import { create } from "@bufbuild/protobuf";

import type { AppDraftListingText } from "../../../domain/ports/console/app-draft-listing-text";
import type { AppDraftSummary } from "../../../domain/ports/console/app-draft-summary";
import type { CreateAppDraftListingTextResponse } from "../../../domain/ports/console/create-app-draft-listing-text-response";
import type { CreateAppDraftResponse } from "../../../domain/ports/console/create-app-draft-response";
import type { GetAppDraftDetailsResponse } from "../../../domain/ports/console/get-app-draft-details-response";
import type { GetMyOrganizationResponse } from "../../../domain/ports/console/get-my-organization-response";
import type { GetOrganizationResponse } from "../../../domain/ports/console/get-organization-response";
import type { GetSelfResponse } from "../../../domain/ports/console/get-self-response";
import type { ListAppDraftSummariesResponse } from "../../../domain/ports/console/list-app-draft-summaries-response";
import type { Organization } from "../../../domain/ports/console/organization";
import type { UpdateAppDraftListingTextResponse } from "../../../domain/ports/console/update-app-draft-listing-text-response";
import type { User, UserRole } from "../../../domain/ports/console/user";

export function toCreateAppDraftResponse(
    response: ProtoCreateAppDraftResponse,
): CreateAppDraftResponse {
    return { appDraftId: response.appDraftId ?? "" };
}

export function toCreateAppDraftListingTextResponse(
    response: ProtoCreateAppDraftListingTextResponse,
): CreateAppDraftListingTextResponse {
    return { etag: response.etag ?? "" };
}

export function toGetAppDraftDetailsResponse(
    response: ProtoGetAppDraftDetailsResponse,
): GetAppDraftDetailsResponse {
    const { listingText } = response;
    return { listingText: listingText && toAppDraftListingText(listingText) };
}

export function toGetMyOrganizationResponse(
    response: ProtoGetMyOrganizationResponse,
): GetMyOrganizationResponse {
    return { organizationId: response.organizationId ?? "" };
}

export function toGetOrganizationResponse(
    response: ProtoGetOrganizationResponse,
): GetOrganizationResponse {
    return { organization: toOrganization(response.organization ?? create(OrganizationSchema)) };
}

export function toGetSelfResponse(response: ProtoGetSelfResponse): GetSelfResponse {
    return { user: toUser(response.user ?? create(UserSchema)) };
}

export function toListAppDraftSummariesResponse(
    response: ProtoListAppDraftSummariesResponse,
): ListAppDraftSummariesResponse {
    return { appDraftSummaries: response.appDraftSummaries.map(toAppDraftSummary) };
}

export function toUpdateAppDraftListingTextResponse(
    response: ProtoUpdateAppDraftListingTextResponse,
): UpdateAppDraftListingTextResponse {
    return { etag: response.etag ?? "" };
}

function toAppDraftListingText(listingText: ProtoAppDraftListingText): AppDraftListingText {
    return {
        name: listingText.name ?? "",
        shortDescription: listingText.shortDescription ?? "",
        etag: listingText.etag ?? "",
    };
}

function toAppDraftSummary(summary: ProtoAppDraftSummary): AppDraftSummary {
    const { versionName, androidApplicationId } = summary;
    return {
        id: summary.id ?? "",
        name: summary.name,
        iconUrl: summary.iconUri,
        // versionName and androidApplicationId are either both present or both not present, so
        // coerce to one of the two valid states if necessary
        package:
            versionName !== undefined && androidApplicationId !== undefined
                ? { versionName, androidApplicationId }
                : undefined,
    };
}

function toOrganization(organization: ProtoOrganization): Organization {
    return {
        id: organization.id ?? "",
        publishedAppLimit: organization.publishedAppLimit ?? 0,
        publishedAppCount: organization.publishedAppCount ?? 0,
        activeAppDraftLimit: organization.activeAppDraftLimit ?? 0,
        activeAppDraftCount: organization.activeAppDraftCount ?? 0,
    };
}

function toUser(user: ProtoUser): User {
    return {
        id: user.id ?? "",
        roles: new Set(user.roles.flatMap((role) => toUserRole(role) ?? [])),
    };
}

function toUserRole(role: ProtoUserRole): UserRole | undefined {
    switch (role) {
        case ProtoUserRole.REVIEWER:
            return "reviewer";
        case ProtoUserRole.PUBLISHER:
            return "publisher";
        default:
            return undefined;
    }
}
