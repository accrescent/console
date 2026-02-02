// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Review } from './review';
import { Update } from '../update';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UpdateService {
    private http = inject(HttpClient);

    private readonly updatesUrl = `${environment.developerApiUrl}/api/v1/updates`;
    private readonly assignedUpdatesUrl = `${this.updatesUrl}/assigned`;

    getAssigned(): Observable<Update[]> {
        return this.http.get<Update[]>(this.assignedUpdatesUrl);
    }

    createReviewForUpdate(updateId: string, review: Review): Observable<Review> {
        return this.http.post<Review>(`${this.updatesUrl}/${updateId}/review`, review);
    }
}
