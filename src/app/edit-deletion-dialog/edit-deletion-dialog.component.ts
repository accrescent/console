// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Edit } from '../edit';

@Component({
    selector: 'acc-edit-deletion-dialog',
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './edit-deletion-dialog.component.html',
    styleUrl: './edit-deletion-dialog.component.scss'
})
export class EditDeletionDialogComponent {
    data = inject<Edit>(MAT_DIALOG_DATA);
}
