// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Pipe, type PipeTransform } from "@angular/core";

import { type Update, UpdateStatus } from "./update";

@Pipe({
    name: "updateFilter",
    standalone: true,
})
export class UpdateFilterPipe implements PipeTransform {
    transform(updates: Update[], showRejected: boolean, showPublished: boolean): Update[] {
        const filter = (update: Update): boolean => {
            return !(
                (update.status === UpdateStatus.Rejected && !showRejected) ||
                (update.status === UpdateStatus.Published && !showPublished)
            );
        };

        return updates.filter((update) => filter(update));
    }
}
