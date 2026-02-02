// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Draft } from '../draft';

@Component({
    selector: 'acc-draft-deletion-dialog',
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './draft-deletion-dialog.component.html',
    styleUrl: './draft-deletion-dialog.component.scss'
})
export class DraftDeletionDialogComponent {
    data = inject<Draft>(MAT_DIALOG_DATA);
}
