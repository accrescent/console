// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { CreateAppDraftResponseSchema } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/create_app_draft_response_pb.js";
import { GetMyOrganizationResponseSchema } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/get_my_organization_response_pb.js";
import { GetOrganizationResponseSchema } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/get_organization_response_pb.js";
import { GetSelfResponseSchema } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/get_self_response_pb.js";
import { OrganizationSchema } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/organization_pb.js";
import { UserSchema } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/user_pb.js";
import { UserRole as ProtoUserRole } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/user_role_pb.js";
import { create } from "@bufbuild/protobuf";

import {
    toCreateAppDraftResponse,
    toGetMyOrganizationResponse,
    toGetOrganizationResponse,
    toGetSelfResponse,
} from "./message-converters";

describe("toCreateAppDraftResponse", () => {
    it("correctly converts a message", () => {
        const response = create(CreateAppDraftResponseSchema, { appDraftId: "draft-id" });

        expect(toCreateAppDraftResponse(response)).toEqual({ appDraftId: "draft-id" });
    });
});

describe("toGetMyOrganizationResponse", () => {
    it("correctly converts a message", () => {
        const response = create(GetMyOrganizationResponseSchema, { organizationId: "org-id" });

        expect(toGetMyOrganizationResponse(response)).toEqual({ organizationId: "org-id" });
    });
});

describe("toGetOrganizationResponse", () => {
    it("correctly converts a message", () => {
        const response = create(GetOrganizationResponseSchema, {
            organization: create(OrganizationSchema, {
                id: "org-id",
                publishedAppLimit: 10,
                publishedAppCount: 3,
                activeAppDraftLimit: 5,
                activeAppDraftCount: 4,
            }),
        });

        expect(toGetOrganizationResponse(response)).toEqual({
            organization: {
                id: "org-id",
                publishedAppLimit: 10,
                publishedAppCount: 3,
                activeAppDraftLimit: 5,
                activeAppDraftCount: 4,
            },
        });
    });
});

describe("toGetSelfResponse", () => {
    it("correctly converts a message", () => {
        const response = create(GetSelfResponseSchema, {
            user: create(UserSchema, {
                id: "user-id",
                roles: [ProtoUserRole.REVIEWER, ProtoUserRole.PUBLISHER],
            }),
        });

        expect(toGetSelfResponse(response)).toEqual({
            user: { id: "user-id", roles: new Set(["reviewer", "publisher"]) },
        });
    });
});
