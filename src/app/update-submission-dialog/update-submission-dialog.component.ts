// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { App } from '../app';
import { Update } from '../update';

@Component({
    selector: 'acc-update-submission-dialog',
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './update-submission-dialog.component.html',
    styleUrl: './update-submission-dialog.component.scss'
})
export class UpdateSubmissionDialogComponent {
    data = inject<{ app: App; update: Update; }>(MAT_DIALOG_DATA);
}
