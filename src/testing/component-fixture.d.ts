// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import "@angular/core/testing";

// Type `nativeElement` as `HTMLElement` instead of `any` since our tests always run against a DOM
// and we want our DOM queries to be type-safe.
declare module "@angular/core/testing" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required to match Angular class
    interface ComponentFixture<T> {
        nativeElement: HTMLElement;
    }
}
