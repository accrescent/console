// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { AppInfo } from "../app-info";
import { Edit } from "../edit";

@Component({
    selector: "acc-edit-submission-dialog",
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: "./edit-submission-dialog.component.html",
    styleUrl: "./edit-submission-dialog.scss",
})
export class EditSubmissionDialog {
    data = inject<{ app: AppInfo; edit: Edit }>(MAT_DIALOG_DATA);
}
