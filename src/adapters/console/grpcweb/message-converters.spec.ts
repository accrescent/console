// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { GetSelfResponseSchema } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/get_self_response_pb.js";
import { UserSchema } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/user_pb.js";
import { UserRole as ProtoUserRole } from "@buf/accrescent_console-api.bufbuild_es/accrescent/console/v1/user_role_pb.js";
import { create } from "@bufbuild/protobuf";

import { toGetSelfResponse } from "./message-converters";

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
