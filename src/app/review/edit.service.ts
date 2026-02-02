// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Edit } from '../edit';
import { Review } from './review';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class EditService {
    private http = inject(HttpClient);

    private readonly editsUrl = `${environment.developerApiUrl}/api/v1/edits`;
    private readonly assignedEditsUrl = `${this.editsUrl}/assigned`;

    getAssigned(): Observable<Edit[]> {
        return this.http.get<Edit[]>(this.assignedEditsUrl);
    }

    createReviewForEdit(editId: string, review: Review): Observable<Review> {
        return this.http.post<Review>(`${this.editsUrl}/${editId}/review`, review);
    }
}
