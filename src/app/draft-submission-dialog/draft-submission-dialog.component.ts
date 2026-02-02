// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Draft } from '../draft';

@Component({
    selector: 'acc-draft-submission-dialog',
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './draft-submission-dialog.component.html',
    styleUrl: './draft-submission-dialog.component.scss'
})
export class DraftSubmissionDialogComponent {
    data = inject<Draft>(MAT_DIALOG_DATA);
}
