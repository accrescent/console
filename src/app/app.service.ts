// SPDX-FileCopyrightText: © 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import { AppInfo } from "./app-info";
import { environment } from "../environments/environment";

@Injectable({
    providedIn: "root",
})
export class AppService {
    private http = inject(HttpClient);

    private readonly appsUrl = `${environment.developerApiUrl}/api/v1/apps`;

    getApp(id: string): Observable<AppInfo> {
        return this.http.get<AppInfo>(`${this.appsUrl}/${id}`);
    }

    getApps(): Observable<AppInfo[]> {
        return this.http.get<AppInfo[]>(this.appsUrl);
    }
}
