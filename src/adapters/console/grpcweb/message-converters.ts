// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { CreateAppDraftResponse as ProtoCreateAppDraftResponse } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/create_app_draft_response_pb.js";
import type { GetMyOrganizationResponse as ProtoGetMyOrganizationResponse } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/get_my_organization_response_pb.js";
import type { GetOrganizationResponse as ProtoGetOrganizationResponse } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/get_organization_response_pb.js";
import type { GetSelfResponse as ProtoGetSelfResponse } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/get_self_response_pb.js";
import {
    type Organization as ProtoOrganization,
    OrganizationSchema,
} from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/organization_pb.js";
import {
    type User as ProtoUser,
    UserSchema,
} from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/user_pb.js";
import { UserRole as ProtoUserRole } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/user_role_pb.js";
import { create } from "@bufbuild/protobuf";

import type { CreateAppDraftResponse } from "../../../domain/ports/console/create-app-draft-response";
import type { GetMyOrganizationResponse } from "../../../domain/ports/console/get-my-organization-response";
import type { GetOrganizationResponse } from "../../../domain/ports/console/get-organization-response";
import type { GetSelfResponse } from "../../../domain/ports/console/get-self-response";
import type { Organization } from "../../../domain/ports/console/organization";
import type { User, UserRole } from "../../../domain/ports/console/user";

export function toCreateAppDraftResponse(
    response: ProtoCreateAppDraftResponse,
): CreateAppDraftResponse {
    return { appDraftId: response.appDraftId ?? "" };
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

function toOrganization(organization: ProtoOrganization): Organization {
    // Counts and limits are practically far below Number.MAX_SAFE_INTEGER, so we don't really need
    // to handle the case where they're out of the number range
    return {
        id: organization.id ?? "",
        publishedAppLimit: Number(organization.publishedAppLimit ?? 0n),
        publishedAppCount: Number(organization.publishedAppCount ?? 0n),
        activeAppDraftLimit: Number(organization.activeAppDraftLimit ?? 0n),
        activeAppDraftCount: Number(organization.activeAppDraftCount ?? 0n),
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
