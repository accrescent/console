// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import {
    inputBinding,
    isSignal,
    outputBinding,
    type Signal,
    signal,
    type WritableSignal,
} from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { MatTooltipHarness } from "@angular/material/tooltip/testing";
import { provideRouter } from "@angular/router";

import type { AppDraftSummary } from "../../../domain/ports/console/app-draft-summary";
import type { Organization } from "../../../domain/ports/console/organization";
import {
    OrgDashboardContent,
    type OrgDashboardContentState,
    type OrgDashboardCreateAppDraftError,
} from "./org-dashboard-content";

const ORGANIZATION: Organization = {
    id: "org-123",
    publishedAppLimit: 10,
    publishedAppCount: 3,
    activeAppDraftLimit: 4,
    activeAppDraftCount: 4,
};

const APP_DRAFTS: readonly AppDraftSummary[] = [{ id: "draft-1" }, { id: "draft-2" }];

describe("OrgDashboardContent", () => {
    let createCount: number;
    let dismissCount: number;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
        createCount = 0;
        dismissCount = 0;
    });

    /**
     * Creates an {@link OrgDashboardContent} in the given state and waits for it to render.
     */
    async function render(
        state: OrgDashboardContentState | Signal<OrgDashboardContentState>,
    ): Promise<ComponentFixture<OrgDashboardContent>> {
        const fixture = TestBed.createComponent(OrgDashboardContent, {
            bindings: [
                inputBinding("state", isSignal(state) ? state : signal(state)),
                outputBinding("createAppDraft", () => createCount++),
                outputBinding("dismissCreateAppDraftError", () => dismissCount++),
            ],
        });
        await fixture.whenStable();
        return fixture;
    }

    function newAppButton(fixture: ComponentFixture<OrgDashboardContent>): HTMLButtonElement {
        return fixture.nativeElement.querySelector("acc-loading-button button")!;
    }

    function appDraftItems(fixture: ComponentFixture<OrgDashboardContent>): HTMLAnchorElement[] {
        return Array.from(fixture.nativeElement.querySelectorAll("li a"));
    }

    function text(element: Element): string {
        return element.textContent?.replace(/\s+/g, " ") ?? "";
    }

    describe("with app drafts", () => {
        let fixture: ComponentFixture<OrgDashboardContent>;

        beforeEach(async () => {
            fixture = await render({
                organization: ORGANIZATION,
                appDrafts: { kind: "loaded", summaries: APP_DRAFTS },
                createAppDraftState: "idle",
            });
        });

        it("should title the page", () => {
            expect(fixture.nativeElement.querySelector("h1")!.textContent).toContain("Dashboard");
        });

        it("should show published apps out of the limit", () => {
            const card: HTMLElement =
                fixture.nativeElement.querySelectorAll<HTMLElement>("acc-quota-card")[0];
            expect(card.textContent).toContain("Published apps");
            expect(text(card)).toContain("3 of 10");
        });

        it("should show active app drafts out of the limit", () => {
            const card: HTMLElement =
                fixture.nativeElement.querySelectorAll<HTMLElement>("acc-quota-card")[1];
            expect(card.textContent).toContain("App drafts");
            expect(text(card)).toContain("4 of 4");
        });

        it("should suggest deleting or publishing a draft when app drafts are full", () => {
            const card: HTMLElement =
                fixture.nativeElement.querySelectorAll<HTMLElement>("acc-quota-card")[1];
            expect(card.textContent).toContain(
                "Delete or publish an app draft to create another one.",
            );
        });

        it("should disable creating an app when app drafts are full", () => {
            expect(newAppButton(fixture).getAttribute("aria-disabled")).toBe("true");
        });

        it("should explain why creating an app is disabled", async () => {
            const tooltip =
                await TestbedHarnessEnvironment.loader(fixture).getHarness(MatTooltipHarness);
            await tooltip.show();

            expect(await tooltip.getTooltipText()).toBe(
                "You've reached your limit of 4 app drafts. Delete or publish an app draft to create another one.",
            );
        });

        it("should list the organization's app drafts", () => {
            expect(appDraftItems(fixture).map((item) => item.getAttribute("href"))).toEqual([
                "/orgs/org-123/appDrafts/draft-1",
                "/orgs/org-123/appDrafts/draft-2",
            ]);
        });
    });

    describe("below the app draft limit", () => {
        const state: OrgDashboardContentState = {
            organization: { ...ORGANIZATION, activeAppDraftCount: 0 },
            appDrafts: { kind: "loaded", summaries: [] },
            createAppDraftState: "idle",
        };

        it.each([
            ["permissionDenied", "You don't have permission to view app drafts"],
            ["unavailable", "This isn't caused by anything you did."],
        ] as const)("should explain a %s error listing app drafts", async (kind, message) => {
            const fixture = await render({
                ...state,
                appDrafts: { kind: "error", error: { kind } },
            });

            const alert: HTMLElement = fixture.nativeElement.querySelector("acc-error-alert")!;
            expect(alert.textContent).toContain("Couldn't load app drafts");
            expect(text(alert)).toContain(message);
        });

        it("should emit createAppDraft when the new app button is clicked", async () => {
            const fixture = await render(state);

            newAppButton(fixture).click();

            expect(createCount).toBe(1);
        });

        it("should show progress while creating an app draft", async () => {
            const fixture = await render({ ...state, createAppDraftState: "loading" });

            expect(newAppButton(fixture).getAttribute("aria-label")).toBe("Creating app");
        });

        it("should not show an error when creating an app draft hasn't failed", async () => {
            const fixture = await render(state);

            expect(fixture.nativeElement.querySelector("acc-error-alert")).toBeNull();
        });

        it.each([
            ["unauthenticated", "You're logged out."],
            ["permissionDenied", "You don't have permission to create apps in this organization."],
            ["resourceLimitExceeded", "You've reached your limit of app drafts."],
            ["unavailable", "This isn't caused by anything you did."],
        ] as const)("should explain a %s error creating an app draft", async (kind, message) => {
            const fixture = await render({
                ...state,
                createAppDraftError: { kind, failedAttempts: 1 },
            });

            const alert: HTMLElement = fixture.nativeElement.querySelector("acc-error-alert")!;
            expect(alert.textContent).toContain("Couldn't create app");
            expect(text(alert)).toContain(message);
        });

        it("should link to the login page after an unauthenticated error creating an app draft", async () => {
            const fixture = await render({
                ...state,
                createAppDraftError: { kind: "unauthenticated", failedAttempts: 1 },
            });

            const link: HTMLAnchorElement =
                fixture.nativeElement.querySelector("acc-error-alert a")!;
            expect(link.textContent).toContain("Log in");
            expect(link.getAttribute("href")).toBe("/login");
        });

        describe("when an error creating an app draft is shown", () => {
            const error: OrgDashboardCreateAppDraftError = {
                kind: "unavailable",
                failedAttempts: 1,
            };
            let pageState: WritableSignal<OrgDashboardContentState>;
            let fixture: ComponentFixture<OrgDashboardContent>;
            let alert: HTMLElement;

            beforeEach(async () => {
                pageState = signal({ ...state, createAppDraftError: error });
                fixture = await render(pageState);
                alert = fixture.nativeElement.querySelector("acc-error-alert")!;
            });

            it("should show how many attempts to create an app draft have failed", async () => {
                pageState.set({ ...state, createAppDraftError: { ...error, failedAttempts: 2 } });
                await fixture.whenStable();

                expect(alert.textContent).toContain("Failed attempts: 2");
            });

            it("should keep showing the same error while creating an app draft again", async () => {
                pageState.set({
                    ...state,
                    createAppDraftState: "pending",
                    createAppDraftError: error,
                });
                await fixture.whenStable();

                expect(fixture.nativeElement.querySelector("acc-error-alert")).toBe(alert);
            });
        });

        describe("when the error creating an app draft is dismissed", () => {
            let fixture: ComponentFixture<OrgDashboardContent>;

            beforeEach(async () => {
                fixture = await render({
                    ...state,
                    createAppDraftError: { kind: "unavailable", failedAttempts: 1 },
                });
                fixture.nativeElement
                    .querySelector<HTMLElement>("button[aria-label=Dismiss]")!
                    .click();
            });

            it("should emit dismissCreateAppDraftError", () => {
                expect(dismissCount).toBe(1);
            });

            it("should move focus to the new app button", () => {
                expect(document.activeElement).toBe(newAppButton(fixture));
            });
        });
    });
});
