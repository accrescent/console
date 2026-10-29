// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { inputBinding, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { type FullPageError, FullPageErrorView } from "./full-page-error-view";

describe("FullPageErrorView", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
    });

    /**
     * Creates a {@link FullPageErrorView} for the given error and waits for it to render.
     */
    async function render(error: FullPageError): Promise<ComponentFixture<FullPageErrorView>> {
        const fixture = TestBed.createComponent(FullPageErrorView, {
            bindings: [inputBinding("error", signal(error))],
        });
        await fixture.whenStable();
        return fixture;
    }

    function text(fixture: ComponentFixture<FullPageErrorView>): string {
        return fixture.nativeElement.textContent.replace(/\s+/g, " ");
    }

    function link(fixture: ComponentFixture<FullPageErrorView>): string | null {
        return fixture.nativeElement.querySelector("a").getAttribute("href");
    }

    describe("when unavailable", () => {
        let fixture: ComponentFixture<FullPageErrorView>;

        beforeEach(async () => {
            fixture = await render({ kind: "unavailable", resource: { kind: "console" } });
        });

        it("should show an error", () => {
            const alert: HTMLElement = fixture.nativeElement.querySelector("[role=alert]");
            expect(alert.textContent).toContain("Something went wrong");
        });

        it("should name the console", () => {
            expect(text(fixture)).toContain("We couldn't load the console.");
        });

        it("should link to the docs", () => {
            expect(link(fixture)).toBe("https://accrescent.app/docs/");
        });
    });

    it("should identify the organization when it's unavailable", async () => {
        const fixture = await render({
            kind: "unavailable",
            resource: { kind: "organization", id: "org-123" },
        });

        expect(text(fixture)).toContain("We couldn't load organization org-123.");
    });

    describe("when permission is denied", () => {
        let fixture: ComponentFixture<FullPageErrorView>;

        beforeEach(async () => {
            fixture = await render({
                kind: "permissionDenied",
                resource: { kind: "organization", id: "org-123" },
            });
        });

        it("should show that the user has no access", () => {
            expect(fixture.nativeElement.querySelector("h1").textContent).toContain("No access");
        });

        it("should identify the organization", () => {
            expect(text(fixture)).toContain(
                "You don't have permission to view organization org-123",
            );
        });

        it("should link to the user's own organization", () => {
            expect(link(fixture)).toBe("/");
        });
    });
});
