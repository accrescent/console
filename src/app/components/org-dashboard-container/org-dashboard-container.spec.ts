// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { inputBinding } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter, Router } from "@angular/router";
import { err, ok, type Result } from "../../../core/result";
import { MIN_PROGRESS_MS, PROGRESS_DELAY_MS } from "../../../domain/delay";
import type { ConsoleApi } from "../../../domain/ports/console/console-api";
import type { CreateAppDraftRequest } from "../../../domain/ports/console/create-app-draft-request";
import type { CreateAppDraftResponse } from "../../../domain/ports/console/create-app-draft-response";
import type {
    CreateAppDraftError,
    GetMyOrganizationError,
    GetOrganizationError,
    GetSelfError,
} from "../../../domain/ports/console/errors";
import type { GetMyOrganizationResponse } from "../../../domain/ports/console/get-my-organization-response";
import type { GetOrganizationResponse } from "../../../domain/ports/console/get-organization-response";
import type { GetSelfResponse } from "../../../domain/ports/console/get-self-response";
import type { Organization } from "../../../domain/ports/console/organization";
import { CONSOLE_API } from "../../tokens";
import type { LoadingButtonState } from "../loading-button/loading-button";
import {
    type OrgDashboardCreateAppDraftError,
    OrgDashboardPage,
    type OrgDashboardPageState,
} from "../org-dashboard-page/org-dashboard-page";
import { OrgDashboardContainer } from "./org-dashboard-container";

const ORGANIZATION: Organization = {
    id: "org-123",
    publishedAppLimit: 10,
    publishedAppCount: 3,
    activeAppDraftLimit: 4,
    activeAppDraftCount: 1,
};

describe("OrgDashboardContainer", () => {
    let consoleApi: FakeConsoleApi;

    beforeEach(() => {
        consoleApi = new FakeConsoleApi();
        TestBed.configureTestingModule({
            providers: [
                // Accept any URL so that tests can check where the container navigated to
                provideRouter([{ path: "**", children: [] }]),
                { provide: CONSOLE_API, useValue: consoleApi },
            ],
        });
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function create(): ComponentFixture<OrgDashboardContainer> {
        return TestBed.createComponent(OrgDashboardContainer, {
            bindings: [inputBinding("orgId", () => ORGANIZATION.id)],
        });
    }

    /**
     * Creates an {@link OrgDashboardContainer} and waits for it to finish loading.
     */
    async function render(): Promise<ComponentFixture<OrgDashboardContainer>> {
        const fixture = create();
        await settle(fixture);
        return fixture;
    }

    async function settle(fixture: ComponentFixture<OrgDashboardContainer>): Promise<void> {
        await vi.runAllTimersAsync();
        await fixture.whenStable();
    }

    function pageState(fixture: ComponentFixture<OrgDashboardContainer>): OrgDashboardPageState {
        fixture.detectChanges();
        return fixture.debugElement
            .query(By.directive(OrgDashboardPage))
            .injector.get(OrgDashboardPage)
            .state();
    }

    function newAppButton(fixture: ComponentFixture<OrgDashboardContainer>): HTMLButtonElement {
        fixture.detectChanges();
        return fixture.nativeElement.querySelector(
            "acc-org-dashboard-page acc-loading-button button",
        );
    }

    function createAppDraftState(
        fixture: ComponentFixture<OrgDashboardContainer>,
    ): LoadingButtonState | undefined {
        const state = pageState(fixture);
        return state.kind === "loaded" ? state.createAppDraftState : undefined;
    }

    function createAppDraftError(
        fixture: ComponentFixture<OrgDashboardContainer>,
    ): OrgDashboardCreateAppDraftError | undefined {
        const state = pageState(fixture);
        return state.kind === "loaded" ? state.createAppDraftError : undefined;
    }

    function clickDismiss(fixture: ComponentFixture<OrgDashboardContainer>): void {
        fixture.nativeElement
            .querySelector("acc-org-dashboard-page button[aria-label=Dismiss]")
            .click();
    }

    it("should not show progress if loading finishes quickly", async () => {
        consoleApi.delayMs = PROGRESS_DELAY_MS - 1;
        const fixture = create();
        expect(pageState(fixture)).toEqual({ kind: "pending" });

        await vi.advanceTimersByTimeAsync(PROGRESS_DELAY_MS - 1);
        expect(pageState(fixture)).toEqual({
            kind: "loaded",
            organization: ORGANIZATION,
            createAppDraftState: "idle",
        });
    });

    it("should show progress for the minimum duration once loading takes long enough", async () => {
        consoleApi.delayMs = PROGRESS_DELAY_MS + 1;
        const fixture = create();

        await vi.advanceTimersByTimeAsync(PROGRESS_DELAY_MS - 1);
        expect(pageState(fixture)).toEqual({ kind: "pending" });

        await vi.advanceTimersByTimeAsync(1);
        expect(pageState(fixture)).toEqual({ kind: "loading" });

        await vi.advanceTimersByTimeAsync(MIN_PROGRESS_MS - 1);
        expect(pageState(fixture)).toEqual({ kind: "loading" });

        await vi.advanceTimersByTimeAsync(1);
        expect(pageState(fixture)).toEqual({
            kind: "loaded",
            organization: ORGANIZATION,
            createAppDraftState: "idle",
        });
    });

    it("should show permission denied when the user can't view the organization", async () => {
        consoleApi.organizationResult = err({ kind: "permissionDenied" });

        const fixture = await render();

        expect(pageState(fixture)).toEqual({
            kind: "error",
            error: {
                kind: "permissionDenied",
                resource: { kind: "organization", id: ORGANIZATION.id },
            },
        });
    });

    it("should redirect to the login page when unauthenticated", async () => {
        consoleApi.organizationResult = err({ kind: "unauthenticated" });

        await render();

        expect(TestBed.inject(Router).url).toBe("/login");
    });

    it("should show an error when any other error occurs", async () => {
        consoleApi.organizationResult = err({ kind: "unknown" });

        const fixture = await render();

        expect(pageState(fixture)).toEqual({
            kind: "error",
            error: { kind: "unavailable", resource: { kind: "organization", id: ORGANIZATION.id } },
        });
    });

    describe("when creating an app draft", () => {
        let fixture: ComponentFixture<OrgDashboardContainer>;

        beforeEach(async () => {
            fixture = await render();
        });

        it("should create the app draft in the organization", async () => {
            newAppButton(fixture).click();
            await settle(fixture);

            expect(consoleApi.createAppDraftRequests).toEqual([
                { organizationId: ORGANIZATION.id },
            ]);
        });

        it("should open the app draft editor when creation succeeds", async () => {
            newAppButton(fixture).click();
            await settle(fixture);

            expect(TestBed.inject(Router).url).toBe(`/orgs/${ORGANIZATION.id}/appDrafts/draft-123`);
        });

        it("should redirect to the login page when unauthenticated", async () => {
            consoleApi.createAppDraftResult = err({ kind: "unauthenticated" });

            newAppButton(fixture).click();
            await settle(fixture);

            expect(TestBed.inject(Router).url).toBe("/login");
        });

        it("should disable the new app button immediately", () => {
            consoleApi.createAppDraftDelayMs = PROGRESS_DELAY_MS + 1;

            newAppButton(fixture).click();

            expect(createAppDraftState(fixture)).toBe("pending");
        });

        it("should show progress for the minimum duration once creation takes long enough", async () => {
            consoleApi.createAppDraftResult = err({ kind: "unknown" });
            consoleApi.createAppDraftDelayMs = PROGRESS_DELAY_MS + 1;

            newAppButton(fixture).click();

            await vi.advanceTimersByTimeAsync(PROGRESS_DELAY_MS - 1);
            expect(createAppDraftState(fixture)).toBe("pending");

            await vi.advanceTimersByTimeAsync(1);
            expect(createAppDraftState(fixture)).toBe("loading");

            await vi.advanceTimersByTimeAsync(MIN_PROGRESS_MS - 1);
            expect(createAppDraftState(fixture)).toBe("loading");

            await vi.advanceTimersByTimeAsync(1);
            expect(createAppDraftState(fixture)).toBe("idle");
        });

        it("should explain when the user can't create app drafts", async () => {
            consoleApi.createAppDraftResult = err({ kind: "permissionDenied" });

            newAppButton(fixture).click();
            await settle(fixture);

            expect(createAppDraftError(fixture)).toEqual({
                kind: "permissionDenied",
                failedAttempts: 1,
            });
        });

        it("should explain when the app draft limit is reached", async () => {
            consoleApi.createAppDraftResult = err({ kind: "resourceLimitExceeded" });

            newAppButton(fixture).click();
            await settle(fixture);

            expect(createAppDraftError(fixture)).toEqual({
                kind: "resourceLimitExceeded",
                failedAttempts: 1,
            });
        });

        describe("when creation fails for any other reason", () => {
            beforeEach(async () => {
                consoleApi.createAppDraftResult = err({ kind: "unknown" });

                newAppButton(fixture).click();
                await settle(fixture);
            });

            it("should show an error", () => {
                expect(createAppDraftError(fixture)).toEqual({
                    kind: "unavailable",
                    failedAttempts: 1,
                });
            });

            it("should enable the new app button again", () => {
                expect(createAppDraftState(fixture)).toBe("idle");
            });

            it("should hide the error when dismissed", () => {
                clickDismiss(fixture);

                expect(createAppDraftError(fixture)).toBeUndefined();
            });

            it("should keep showing the error while creating again", () => {
                consoleApi.createAppDraftDelayMs = PROGRESS_DELAY_MS + 1;

                newAppButton(fixture).click();

                expect(createAppDraftError(fixture)).toEqual({
                    kind: "unavailable",
                    failedAttempts: 1,
                });
            });

            it("should count another failed attempt when creating again fails", async () => {
                newAppButton(fixture).click();
                await settle(fixture);

                expect(createAppDraftError(fixture)).toEqual({
                    kind: "unavailable",
                    failedAttempts: 2,
                });
            });

            it("should count failed attempts from one again after the error is dismissed", async () => {
                clickDismiss(fixture);

                newAppButton(fixture).click();
                await settle(fixture);

                expect(createAppDraftError(fixture)).toEqual({
                    kind: "unavailable",
                    failedAttempts: 1,
                });
            });

            it("should hide the error when creating again succeeds", async () => {
                consoleApi.createAppDraftResult = ok({ appDraftId: "draft-123" });

                newAppButton(fixture).click();
                await settle(fixture);

                expect(createAppDraftError(fixture)).toBeUndefined();
            });
        });
    });
});

/**
 * {@link ConsoleApi} that records app draft creation attempts and returns preconfigured results
 * after preconfigured delays.
 */
class FakeConsoleApi implements ConsoleApi {
    organizationResult: Result<GetOrganizationResponse, GetOrganizationError> = ok({
        organization: ORGANIZATION,
    });
    delayMs = 0;
    createAppDraftRequests: CreateAppDraftRequest[] = [];
    createAppDraftResult: Result<CreateAppDraftResponse, CreateAppDraftError> = ok({
        appDraftId: "draft-123",
    });
    createAppDraftDelayMs = 0;

    getSelf(): Promise<Result<GetSelfResponse, GetSelfError>> {
        throw new Error("not used by OrgDashboardContainer");
    }

    async getOrganization(): Promise<Result<GetOrganizationResponse, GetOrganizationError>> {
        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
        return this.organizationResult;
    }

    getMyOrganization(): Promise<Result<GetMyOrganizationResponse, GetMyOrganizationError>> {
        throw new Error("not used by OrgDashboardContainer");
    }

    async createAppDraft(
        request: CreateAppDraftRequest,
    ): Promise<Result<CreateAppDraftResponse, CreateAppDraftError>> {
        this.createAppDraftRequests.push(request);
        await new Promise((resolve) => setTimeout(resolve, this.createAppDraftDelayMs));
        return this.createAppDraftResult;
    }
}
