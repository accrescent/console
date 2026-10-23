// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { inputBinding, outputBinding, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { Organization } from "../../../domain/ports/console/organization";
import { OrgDashboardPage, type OrgDashboardPageState } from "./org-dashboard-page";

const ORGANIZATION: Organization = {
    id: "org-123",
    publishedAppLimit: 10,
    publishedAppCount: 3,
    activeAppDraftLimit: 4,
    activeAppDraftCount: 4,
};

describe("OrgDashboardPage", () => {
    let reloadCount: number;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
        reloadCount = 0;
    });

    /**
     * Creates an {@link OrgDashboardPage} in the given state and waits for it to render.
     */
    async function render(
        state: OrgDashboardPageState,
    ): Promise<ComponentFixture<OrgDashboardPage>> {
        const fixture = TestBed.createComponent(OrgDashboardPage, {
            bindings: [
                inputBinding("state", signal(state)),
                outputBinding("reload", () => reloadCount++),
            ],
        });
        await fixture.whenStable();
        return fixture;
    }

    it("should show a progress indicator when loading", async () => {
        const fixture = await render({ kind: "loading" });

        expect(fixture.nativeElement.querySelector("mat-progress-spinner")).not.toBeNull();
    });

    it.each(["loadingFailed", "reloading"] as const)(
        "should show an error when %s",
        async (kind) => {
            const fixture = await render({ kind });

            const alert: HTMLElement = fixture.nativeElement.querySelector("[role=alert]");
            expect(alert.textContent).toContain("Something went wrong");
        },
    );

    it("should emit reload when the reload button is clicked after loading failed", async () => {
        const fixture = await render({ kind: "loadingFailed" });

        fixture.nativeElement.querySelector("button").click();

        expect(reloadCount).toBe(1);
    });

    describe("when reloading", () => {
        let fixture: ComponentFixture<OrgDashboardPage>;

        beforeEach(async () => {
            fixture = await render({ kind: "reloading" });
        });

        it("should show a progress indicator in the reload button", () => {
            const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
            expect(button.querySelector("mat-progress-spinner")).not.toBeNull();
        });

        it("should not emit reload when the reload button is clicked", () => {
            fixture.nativeElement.querySelector("button").click();

            expect(reloadCount).toBe(0);
        });
    });

    it("should link to the user's own organization when permission is denied", async () => {
        const fixture = await render({ kind: "permissionDenied" });

        const link: HTMLAnchorElement = fixture.nativeElement.querySelector("a");
        expect(link.getAttribute("href")).toBe("/");
    });

    describe("when loaded", () => {
        let fixture: ComponentFixture<OrgDashboardPage>;

        beforeEach(async () => {
            fixture = await render({ kind: "loaded", organization: ORGANIZATION });
        });

        it("should title the page", () => {
            expect(fixture.nativeElement.querySelector("h1").textContent).toContain("Dashboard");
        });

        it("should show published apps out of the limit", () => {
            const card: HTMLElement = fixture.nativeElement.querySelectorAll("acc-quota-card")[0];
            expect(card.textContent).toContain("Published apps");
            expect(card.textContent?.replace(/\s+/g, " ")).toContain("3 of 10");
        });

        it("should show active app drafts out of the limit", () => {
            const card: HTMLElement = fixture.nativeElement.querySelectorAll("acc-quota-card")[1];
            expect(card.textContent).toContain("App drafts");
            expect(card.textContent?.replace(/\s+/g, " ")).toContain("4 of 4");
        });

        it("should suggest deleting or publishing a draft when app drafts are full", () => {
            const card: HTMLElement = fixture.nativeElement.querySelectorAll("acc-quota-card")[1];
            expect(card.textContent).toContain(
                "Delete or publish an app draft to create another one.",
            );
        });
    });
});
