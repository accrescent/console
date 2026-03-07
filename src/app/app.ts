// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
    selector: "acc-root",
    imports: [RouterOutlet],
    templateUrl: "./app.html",
})
export class App {
    protected readonly title = signal("console");
}
