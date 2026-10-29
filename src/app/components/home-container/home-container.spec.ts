// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter, Router } from "@angular/router";
import { err, ok, type Result } from "../../../core/result";
import { MIN_PROGRESS_MS, PROGRESS_DELAY_MS } from "../../../domain/delay";
import type { ConsoleApi } from "../../../domain/ports/console/console-api";
import type { CreateAppDraftResponse } from "../../../domain/ports/console/create-app-draft-response";
import type {
    CreateAppDraftError,
    GetMyOrganizationError,
    GetOrganizationError,
    GetSelfError,
    ListAppDraftSummariesError,
} from "../../../domain/ports/console/errors";
import type { GetMyOrganizationResponse } from "../../../domain/ports/console/get-my-organization-response";
import type { GetOrganizationResponse } from "../../../domain/ports/console/get-organization-response";
import type { GetSelfResponse } from "../../../domain/ports/console/get-self-response";
import type { ListAppDraftSummariesResponse } from "../../../domain/ports/console/list-app-draft-summaries-response";
import { CONSOLE_API } from "../../tokens";
import { HomePage, type HomePageState } from "../home-page/home-page";
import { HomeContainer } from "./home-container";

const ORGANIZATION_ID = "org-123";

const CONSOLE_UNAVAILABLE: HomePageState = {
    kind: "error",
    error: { kind: "unavailable", resource: { kind: "console" } },
};

describe("HomeContainer", () => {
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

    function pageState(fixture: ComponentFixture<HomeContainer>): HomePageState {
        fixture.detectChanges();
        return fixture.debugElement.query(By.directive(HomePage)).injector.get(HomePage).state();
    }

    it("should not show progress if loading finishes quickly", async () => {
        consoleApi.myOrganizationResult = err({ kind: "unknown" });
        consoleApi.delayMs = PROGRESS_DELAY_MS - 1;
        const fixture = TestBed.createComponent(HomeContainer);
        expect(pageState(fixture)).toEqual({ kind: "pending" });

        await vi.advanceTimersByTimeAsync(PROGRESS_DELAY_MS - 1);
        expect(pageState(fixture)).toEqual(CONSOLE_UNAVAILABLE);
    });

    it("should show progress for the minimum duration once loading takes long enough", async () => {
        consoleApi.myOrganizationResult = err({ kind: "unknown" });
        consoleApi.delayMs = PROGRESS_DELAY_MS + 1;
        const fixture = TestBed.createComponent(HomeContainer);

        await vi.advanceTimersByTimeAsync(PROGRESS_DELAY_MS - 1);
        expect(pageState(fixture)).toEqual({ kind: "pending" });

        await vi.advanceTimersByTimeAsync(1);
        expect(pageState(fixture)).toEqual({ kind: "loading" });

        await vi.advanceTimersByTimeAsync(MIN_PROGRESS_MS - 1);
        expect(pageState(fixture)).toEqual({ kind: "loading" });

        await vi.advanceTimersByTimeAsync(1);
        expect(pageState(fixture)).toEqual(CONSOLE_UNAVAILABLE);
    });

    it("should redirect to the organization dashboard when authenticated", async () => {
        consoleApi.myOrganizationResult = ok({ organizationId: ORGANIZATION_ID });

        await render();

        expect(TestBed.inject(Router).url).toBe(`/orgs/${ORGANIZATION_ID}/dashboard`);
    });

    it("should redirect to the login page when unauthenticated", async () => {
        consoleApi.myOrganizationResult = err({ kind: "unauthenticated" });

        await render();

        expect(TestBed.inject(Router).url).toBe("/login");
    });

    it("should show an error when any other error occurs", async () => {
        consoleApi.myOrganizationResult = err({ kind: "unknown" });

        const fixture = await render();

        expect(pageState(fixture)).toEqual(CONSOLE_UNAVAILABLE);
    });
});

/**
 * Creates a {@link HomeContainer} and waits for it to finish redirecting or showing an error.
 */
async function render(): Promise<ComponentFixture<HomeContainer>> {
    const fixture = TestBed.createComponent(HomeContainer);
    await vi.runAllTimersAsync();
    await fixture.whenStable();
    return fixture;
}

/**
 * {@link ConsoleApi} that returns preconfigured results after a preconfigured delay.
 */
class FakeConsoleApi implements ConsoleApi {
    myOrganizationResult: Result<GetMyOrganizationResponse, GetMyOrganizationError> = ok({
        organizationId: ORGANIZATION_ID,
    });
    delayMs = 0;

    createAppDraft(): Promise<Result<CreateAppDraftResponse, CreateAppDraftError>> {
        throw new Error("not used by HomeContainer");
    }

    getSelf(): Promise<Result<GetSelfResponse, GetSelfError>> {
        throw new Error("not used by HomeContainer");
    }

    getOrganization(): Promise<Result<GetOrganizationResponse, GetOrganizationError>> {
        throw new Error("not used by HomeContainer");
    }

    async getMyOrganization(): Promise<Result<GetMyOrganizationResponse, GetMyOrganizationError>> {
        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
        return this.myOrganizationResult;
    }

    listAppDraftSummaries(): Promise<
        Result<ListAppDraftSummariesResponse, ListAppDraftSummariesError>
    > {
        throw new Error("not used by HomeContainer");
    }
}
