// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter, Router } from "@angular/router";
import { err, ok, type Result } from "../../../core/result";
import { DELAY_MS } from "../../../domain/delay";
import type { ConsoleApi } from "../../../domain/ports/console/console-api";
import type { GetSelfError } from "../../../domain/ports/console/errors";
import type { GetSelfResponse } from "../../../domain/ports/console/get-self-response";
import type { User } from "../../../domain/ports/console/user";
import { CONSOLE_API } from "../../tokens";
import { HomePage, HomePageState } from "../home-page/home-page";
import { HomeContainer } from "./home-container";

const USER: User = { id: "user-123", roles: new Set() };

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
        consoleApi.selfResult = err({ kind: "unknown" });
        const fixture = TestBed.createComponent(HomeContainer);
        const page = fixture.debugElement.query(By.directive(HomePage)).injector.get(HomePage);

        await vi.advanceTimersByTimeAsync(DELAY_MS - 1);
        fixture.detectChanges();
        expect(page.state()).toBe(HomePageState.Loading);

        await vi.advanceTimersByTimeAsync(1);
        fixture.detectChanges();
        expect(page.state()).toBe(HomePageState.LoadingFailed);
    });

    it("should redirect to the dashboard when authenticated", async () => {
        consoleApi.selfResult = ok({ user: USER });

        await render();

        expect(TestBed.inject(Router).url).toBe("/dashboard");
    });

    it("should redirect to the login page when unauthenticated", async () => {
        consoleApi.selfResult = err({ kind: "unauthenticated" });

        await render();

        expect(TestBed.inject(Router).url).toBe("/login");
    });

    describe("when another error occurs", () => {
        let fixture: ComponentFixture<HomeContainer>;
        let page: HomePage;

        beforeEach(async () => {
            consoleApi.selfResult = err({ kind: "unknown" });
            fixture = await render();
            page = fixture.debugElement.query(By.directive(HomePage)).injector.get(HomePage);
        });

        function pageState(): HomePageState {
            fixture.detectChanges();
            return page.state();
        }

        function clickReload(): void {
            const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
            button.click();
        }

        it("should show an error", () => {
            expect(pageState()).toBe(HomePageState.LoadingFailed);
        });

        describe("when reloading", () => {
            it("should show progress for the minimum duration even if reloading fails quickly", async () => {
                clickReload();

                await vi.advanceTimersByTimeAsync(DELAY_MS - 1);
                expect(pageState()).toBe(HomePageState.Reloading);

                await vi.advanceTimersByTimeAsync(1);
                expect(pageState()).toBe(HomePageState.LoadingFailed);
            });

            it("should redirect to the dashboard when reloading succeeds", async () => {
                consoleApi.selfResult = ok({ user: USER });

                clickReload();
                await vi.advanceTimersByTimeAsync(DELAY_MS);

                expect(TestBed.inject(Router).url).toBe("/dashboard");
            });
        });
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
    selfResult: Result<GetSelfResponse, GetSelfError> = ok({ user: USER });

    async getSelf(): Promise<Result<GetSelfResponse, GetSelfError>> {
        return this.selfResult;
    }
}
