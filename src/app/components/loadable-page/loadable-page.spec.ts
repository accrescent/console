// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, signal, type WritableSignal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import type { FullPageError } from "../full-page-error-view/full-page-error-view";
import { LoadablePage, type PageState } from "./loadable-page";

@Component({
    imports: [LoadablePage],
    template: `<p *accLoadablePage="state(); let loaded">{{ loaded }}</p>`,
})
class TestHost {
    readonly state: WritableSignal<PageState<string, FullPageError>> = signal({ kind: "pending" });
}

describe("LoadablePage", () => {
    let fixture: ComponentFixture<TestHost>;

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHost);
    });

    it("should show nothing when pending", async () => {
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector("main")!.childElementCount).toBe(0);
    });

    it("should show a progress indicator when loading", async () => {
        fixture.componentInstance.state.set({ kind: "loading" });
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector("mat-progress-spinner")).not.toBeNull();
    });

    it("should show an error when loading failed", async () => {
        fixture.componentInstance.state.set({
            kind: "error",
            error: { kind: "unavailable", resource: { kind: "console" } },
        });
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector("[role=alert]")).not.toBeNull();
    });

    it("should show the content when loaded", async () => {
        fixture.componentInstance.state.set({ kind: "loaded", value: "content" });
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector("p")!.textContent).toBe("content");
    });
});
