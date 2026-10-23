// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { inputBinding } from "@angular/core";
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
import type { Organization } from "../../../domain/ports/console/organization";
import { CONSOLE_API } from "../../tokens";
import {
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
        await vi.advanceTimersByTimeAsync(DELAY_MS);
        await fixture.whenStable();
        return fixture;
    }

    function pageState(fixture: ComponentFixture<OrgDashboardContainer>): OrgDashboardPageState {
        fixture.detectChanges();
        return fixture.debugElement
            .query(By.directive(OrgDashboardPage))
            .injector.get(OrgDashboardPage)
            .state();
    }

    it("should show progress for the minimum duration even if loading finishes quickly", async () => {
        const fixture = create();

        await vi.advanceTimersByTimeAsync(DELAY_MS - 1);
        expect(pageState(fixture)).toEqual({ kind: "loading" });

        await vi.advanceTimersByTimeAsync(1);
        expect(pageState(fixture)).toEqual({
            kind: "loaded",
            organization: ORGANIZATION,
        });
    });

    it("should show permission denied when the user can't view the organization", async () => {
        consoleApi.organizationResult = err({ kind: "permissionDenied" });

        const fixture = await render();

        expect(pageState(fixture)).toEqual({ kind: "permissionDenied" });
    });

    it("should redirect to the login page when unauthenticated", async () => {
        consoleApi.organizationResult = err({ kind: "unauthenticated" });

        await render();

        expect(TestBed.inject(Router).url).toBe("/login");
    });

    describe("when another error occurs", () => {
        let fixture: ComponentFixture<OrgDashboardContainer>;

        beforeEach(async () => {
            consoleApi.organizationResult = err({ kind: "unknown" });
            fixture = await render();
        });

        function clickReload(): void {
            const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
            button.click();
        }

        it("should show an error", () => {
            expect(pageState(fixture)).toEqual({ kind: "loadingFailed" });
        });

        describe("when reloading", () => {
            it("should show progress for the minimum duration even if reloading fails quickly", async () => {
                clickReload();

                await vi.advanceTimersByTimeAsync(DELAY_MS - 1);
                expect(pageState(fixture)).toEqual({ kind: "reloading" });

                await vi.advanceTimersByTimeAsync(1);
                expect(pageState(fixture)).toEqual({ kind: "loadingFailed" });
            });

            it("should show the organization when reloading succeeds", async () => {
                consoleApi.organizationResult = ok({ organization: ORGANIZATION });

                clickReload();
                await vi.advanceTimersByTimeAsync(DELAY_MS);

                expect(pageState(fixture)).toEqual({
                    kind: "loaded",
                    organization: ORGANIZATION,
                });
            });
        });
    });
});

/**
 * {@link ConsoleApi} that returns preconfigured results.
 */
class FakeConsoleApi implements ConsoleApi {
    organizationResult: Result<GetOrganizationResponse, GetOrganizationError> = ok({
        organization: ORGANIZATION,
    });

    getSelf(): Promise<Result<GetSelfResponse, GetSelfError>> {
        throw new Error("not used by OrgDashboardContainer");
    }

    async getOrganization(): Promise<Result<GetOrganizationResponse, GetOrganizationError>> {
        return this.organizationResult;
    }

    getMyOrganization(): Promise<Result<GetMyOrganizationResponse, GetMyOrganizationError>> {
        throw new Error("not used by OrgDashboardContainer");
    }
}
