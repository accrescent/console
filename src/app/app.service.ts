// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { App } from './app';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    private http = inject(HttpClient);

    private readonly appsUrl = `${environment.developerApiUrl}/api/v1/apps`;

    getApp(id: string): Observable<App> {
        return this.http.get<App>(`${this.appsUrl}/${id}`);
    }

    getApps(): Observable<App[]> {
        return this.http.get<App[]>(this.appsUrl);
    }
}
