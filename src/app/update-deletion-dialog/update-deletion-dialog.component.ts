// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Update } from '../update';

@Component({
    selector: 'acc-update-deletion-dialog',
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './update-deletion-dialog.component.html',
    styleUrl: './update-deletion-dialog.component.scss'
})
export class UpdateDeletionDialogComponent {
    data = inject<Update>(MAT_DIALOG_DATA);
}
