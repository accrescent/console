// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { App } from '../app';
import { Edit } from '../edit';

@Component({
    selector: 'acc-edit-submission-dialog',
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './edit-submission-dialog.component.html',
    styleUrl: './edit-submission-dialog.component.scss'
})
export class EditSubmissionDialogComponent {
    data = inject<{ app: App; edit: Edit; }>(MAT_DIALOG_DATA);
}
