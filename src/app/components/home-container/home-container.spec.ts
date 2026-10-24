// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter, Router } from "@angular/router";
import { err, ok, type Result } from "../../../core/result";
import { DELAY_MS } from "../../../domain/delay";
import type { ConsoleApi } from "../../../domain/ports/console/console-api";
import type {
    GetMyOrganizationError,
    GetOrganizationError,
    GetSelfError,
} from "../../../domain/ports/console/errors";
import type { GetMyOrganizationResponse } from "../../../domain/ports/console/get-my-organization-response";
import type { GetOrganizationResponse } from "../../../domain/ports/console/get-organization-response";
import type { GetSelfResponse } from "../../../domain/ports/console/get-self-response";
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

    it("should show progress for the minimum duration even if loading finishes quickly", async () => {
        consoleApi.myOrganizationResult = err({ kind: "unknown" });
        const fixture = TestBed.createComponent(HomeContainer);
        const page = fixture.debugElement.query(By.directive(HomePage)).injector.get(HomePage);

        await vi.advanceTimersByTimeAsync(DELAY_MS - 1);
        fixture.detectChanges();
        expect(page.state()).toEqual({ kind: "loading" });

        await vi.advanceTimersByTimeAsync(1);
        fixture.detectChanges();
        expect(page.state()).toEqual(CONSOLE_UNAVAILABLE);
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

        fixture.detectChanges();
        const page = fixture.debugElement.query(By.directive(HomePage)).injector.get(HomePage);
        expect(page.state()).toEqual(CONSOLE_UNAVAILABLE);
    });
});

/**
 * Creates a {@link HomeContainer} and waits for it to finish redirecting or showing an error.
 */
async function render(): Promise<ComponentFixture<HomeContainer>> {
    const fixture = TestBed.createComponent(HomeContainer);
    await vi.advanceTimersByTimeAsync(DELAY_MS);
    await fixture.whenStable();
    return fixture;
}

/**
 * {@link ConsoleApi} that returns preconfigured results.
 */
class FakeConsoleApi implements ConsoleApi {
    myOrganizationResult: Result<GetMyOrganizationResponse, GetMyOrganizationError> = ok({
        organizationId: ORGANIZATION_ID,
    });

    getSelf(): Promise<Result<GetSelfResponse, GetSelfError>> {
        throw new Error("not used by HomeContainer");
    }

    getOrganization(): Promise<Result<GetOrganizationResponse, GetOrganizationError>> {
        throw new Error("not used by HomeContainer");
    }

    async getMyOrganization(): Promise<Result<GetMyOrganizationResponse, GetMyOrganizationError>> {
        return this.myOrganizationResult;
    }
}
