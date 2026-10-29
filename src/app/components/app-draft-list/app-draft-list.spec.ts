// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { inputBinding, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { AppDraftSummary } from "../../../domain/ports/console/app-draft-summary";
import { AppDraftList } from "./app-draft-list";

const ICON_URL = "data:image/png;base64,";

const APP_DRAFTS: readonly AppDraftSummary[] = [
    {
        id: "draft-1",
        name: "Weather",
        iconUrl: ICON_URL,
        package: { versionName: "1.2.0", androidApplicationId: "com.example.weather" },
    },
    { id: "draft-2" },
];

describe("AppDraftList", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
    });

    /**
     * Creates an {@link AppDraftList} showing the given app drafts and waits for it to render.
     */
    async function render(
        appDrafts: readonly AppDraftSummary[],
    ): Promise<ComponentFixture<AppDraftList>> {
        const fixture = TestBed.createComponent(AppDraftList, {
            bindings: [
                inputBinding("orgId", signal("org-123")),
                inputBinding("appDrafts", signal(appDrafts)),
            ],
        });
        await fixture.whenStable();
        return fixture;
    }

    function items(fixture: ComponentFixture<AppDraftList>): HTMLAnchorElement[] {
        return Array.from(fixture.nativeElement.querySelectorAll("li a"));
    }

    function text(element: Element): string {
        return element.textContent?.replace(/\s+/g, " ") ?? "";
    }

    describe("with app drafts", () => {
        let fixture: ComponentFixture<AppDraftList>;

        beforeEach(async () => {
            fixture = await render(APP_DRAFTS);
        });

        it("should show each app draft's name and package", () => {
            const appDraftItems = items(fixture);

            expect(appDraftItems.length).toBe(2);
            expect(text(appDraftItems[0]!)).toContain("Weather com.example.weather · 1.2.0");
        });

        it("should show placeholders for missing app draft details", () => {
            expect(text(items(fixture)[1]!)).toContain("Untitled app No package yet");
        });

        it("should show each app draft's icon", () => {
            const icon = items(fixture)[0]!.querySelector("img");

            expect(icon?.getAttribute("src")).toBe(ICON_URL);
        });

        it("should show a placeholder icon for app drafts without one", () => {
            const item = items(fixture)[1]!;

            expect(item.querySelector("img")).toBeNull();
            expect(text(item)).toContain("android");
        });

        it("should show a chevron in each app draft's link", () => {
            for (const item of items(fixture)) {
                expect(item.querySelector(":scope > mat-icon")?.textContent?.trim()).toBe(
                    "chevron_right",
                );
            }
        });

        it("should link to the editor for each app draft", () => {
            expect(items(fixture).map((item) => item.getAttribute("href"))).toEqual([
                "/orgs/org-123/appDrafts/draft-1",
                "/orgs/org-123/appDrafts/draft-2",
            ]);
        });
    });

    it("should explain when there are no app drafts", async () => {
        const fixture = await render([]);

        expect(text(fixture.nativeElement)).toContain("No app drafts");
        expect(items(fixture)).toEqual([]);
    });
});
