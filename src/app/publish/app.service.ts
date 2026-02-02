// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    private http = inject(HttpClient);

    private readonly appsUrl = `${environment.developerApiUrl}/api/v1/apps`;

    publishDraft(draftId: string): Observable<void> {
        return this.http.post<void>(this.appsUrl, { draft_id: draftId });
    }
}
