// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input, output, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { NewUpdateForm } from '../new-update-form';

@Component({
    selector: 'acc-new-update-editor',
    imports: [MatButtonModule, MatCardModule, ReactiveFormsModule],
    templateUrl: './new-update-editor.component.html',
    styleUrl: './new-update-editor.component.scss'
})
export class NewUpdateEditorComponent {
    private fb = inject(NonNullableFormBuilder);

    readonly submitDisabled = input(false);
    readonly formSubmit = output<NewUpdateForm>();

    form = this.fb.group({
        apkSet: ['', Validators.required],
    });

    emitForm(): void {
        const apkSet = (<HTMLInputElement>document.getElementById('apkset')).files?.[0];

        if (apkSet !== undefined) {
            const form: NewUpdateForm = { apkSet: apkSet };

            this.formSubmit.emit(form);
        }
    }
}
