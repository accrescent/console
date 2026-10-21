// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { GetSelfResponse as ProtoGetSelfResponse } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/get_self_response_pb.js";
import {
    type User as ProtoUser,
    UserSchema,
} from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/user_pb.js";
import { UserRole as ProtoUserRole } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/user_role_pb.js";
import { create } from "@bufbuild/protobuf";

import type { GetSelfResponse } from "../../../domain/ports/console/get-self-response";
import type { User, UserRole } from "../../../domain/ports/console/user";

export function toGetSelfResponse(response: ProtoGetSelfResponse): GetSelfResponse {
    return { user: toUser(response.user ?? create(UserSchema)) };
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
