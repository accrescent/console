// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, output, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { atLeastOne } from '../at-least-one.validator';
import { NewEditForm } from '../new-edit-form';

@Component({
    selector: 'acc-new-edit-editor',
    imports: [
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    templateUrl: './new-edit-editor.component.html',
    styleUrls: ['./new-edit-editor.component.scss']
})
export class NewEditEditorComponent {
    private fb = inject(NonNullableFormBuilder);

    readonly formSubmit = output<NewEditForm>();

    form = this.fb.group({
        shortDescription: ['', [Validators.minLength(3), Validators.maxLength(80)]],
    }, { validators: atLeastOne(Validators.required) });

    shouldShowLengthError(): boolean {
        const shortDescription = this.form.controls['shortDescription'];

        return shortDescription.hasError('minlength') || shortDescription.hasError('maxlength');
    }

    emitForm(): void {
        const form: NewEditForm = {
            shortDescription: this.form.value.shortDescription,
        };

        this.formSubmit.emit(form);
    }
}
