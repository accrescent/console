// Copyright 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input, output, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { NewDraftForm } from '../new-draft-form';

@Component({
    selector: 'acc-new-draft-editor',
    imports: [
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    templateUrl: './new-draft-editor.component.html',
    styleUrl: './new-draft-editor.component.scss',
})
export class NewDraftEditorComponent {
    private fb = inject(NonNullableFormBuilder);

    readonly submitDisabled = input(false);
    readonly formSubmit = output<NewDraftForm>();

    form = this.fb.group({
        apkSet: ['', Validators.required],
        icon: ['', Validators.required],
        label: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        shortDescription: [
            '',
            [Validators.required, Validators.minLength(3), Validators.maxLength(80)],
        ],
    });

    labelLengthError(): boolean {
        const label = this.form.controls['label'];

        return (label.hasError('minlength') || label.hasError('maxlength')) &&
            !label.hasError('required');
    }

    shortDescriptionLengthError(): boolean {
        const shortDescription = this.form.controls['shortDescription'];

        return (shortDescription.hasError('minlength') || shortDescription.hasError('maxlength')) &&
            !shortDescription.hasError('required');
    }

    emitForm(): void {
        const apkSet = (<HTMLInputElement>document.getElementById('apkset')).files?.[0];
        const icon = (<HTMLInputElement>document.getElementById('icon')).files?.[0];

        if (
            apkSet !== undefined &&
            icon !== undefined &&
            this.form.value.label !== undefined &&
            this.form.value.shortDescription !== undefined
        ) {
            const form: NewDraftForm = {
                apkSet: apkSet,
                icon: icon,
                label: this.form.value.label,
                shortDescription: this.form.value.shortDescription,
            };

            this.formSubmit.emit(form);
        }
    }
}
