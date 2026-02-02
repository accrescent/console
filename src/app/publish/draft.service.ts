// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Draft } from '../draft';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DraftService {
    private http = inject(HttpClient);

    private readonly approvedDraftsUrl = `${environment.developerApiUrl}/api/v1/drafts/approved`;

    getApproved(): Observable<Draft[]> {
        return this.http.get<Draft[]>(this.approvedDraftsUrl);
    }
}
