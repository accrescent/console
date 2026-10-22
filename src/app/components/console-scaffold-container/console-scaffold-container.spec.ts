// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { MATERIAL_ANIMATIONS } from "@angular/material/core";
import { provideRouter, Router } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { err, ok, type Result } from "../../../core/result";
import { DELAY_MS } from "../../../domain/delay";
import type { AuthnApi } from "../../../domain/ports/authn/authn-api";
import type { LogOutError } from "../../../domain/ports/authn/errors";
import { AUTHN_API } from "../../tokens";
import { ConsoleScaffoldContainer } from "./console-scaffold-container";

@Component({ template: "<p>Child page</p>" })
class ChildPage {}

describe("ConsoleScaffoldContainer", () => {
    let authnApi: FakeAuthnApi;
    let harness: RouterTestingHarness;

    beforeEach(async () => {
        authnApi = new FakeAuthnApi();
        TestBed.configureTestingModule({
            providers: [
                provideRouter([
                    {
                        path: "",
                        component: ConsoleScaffoldContainer,
                        children: [{ path: "child", component: ChildPage }],
                    },
                    // Accept any other URL so that tests can check where the container navigated to
                    { path: "**", children: [] },
                ]),
                { provide: AUTHN_API, useValue: authnApi },
                // Close snackbars immediately instead of after their exit animation
                { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
            ],
        });

        harness = await RouterTestingHarness.create("/child");
        // Only fake timeouts so that Angular can still schedule change detection with
        // requestAnimationFrame, which whenStable() waits for
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function clickLogOut(): void {
        harness.fixture.nativeElement.querySelector("acc-loading-button button").click();
    }

    /**
     * Waits for logging out to finish, including the minimum progress indicator duration.
     */
    async function waitForLogOut(): Promise<void> {
        await vi.advanceTimersByTimeAsync(DELAY_MS);
        await harness.fixture.whenStable();
    }

    function clickDismiss(): void {
        document.querySelector<HTMLButtonElement>("mat-snack-bar-container button")!.click();
    }

    function snackBarText(): string | undefined {
        return document.querySelector("mat-snack-bar-container")?.textContent ?? undefined;
    }

    it("should redirect to the login page when logout succeeds", async () => {
        clickLogOut();
        await waitForLogOut();

        expect(authnApi.logOutCount).toBe(1);
        expect(TestBed.inject(Router).url).toBe("/login");
    });

    it("should redirect to the login page when already logged out", async () => {
        authnApi.logOutResult = err({ kind: "unauthenticated" });

        clickLogOut();
        await waitForLogOut();

        expect(TestBed.inject(Router).url).toBe("/login");
    });

    it("should show the progress indicator for the minimum duration even if logout fails quickly", async () => {
        authnApi.logOutResult = err({ kind: "unknown" });

        clickLogOut();

        await vi.advanceTimersByTimeAsync(DELAY_MS - 1);
        harness.detectChanges();
        expect(harness.fixture.nativeElement.querySelector("mat-progress-spinner")).not.toBeNull();

        await vi.advanceTimersByTimeAsync(1);
        harness.detectChanges();
        expect(harness.fixture.nativeElement.querySelector("mat-progress-spinner")).toBeNull();
    });

    describe("when logout fails", () => {
        beforeEach(async () => {
            authnApi.logOutResult = err({ kind: "unknown" });

            clickLogOut();
            await waitForLogOut();
        });

        it("should not redirect", () => {
            expect(TestBed.inject(Router).url).toBe("/child");
        });

        it("should show an error", () => {
            expect(snackBarText()).toContain("Couldn't log out");
        });

        it("should hide the error when dismissed", async () => {
            clickDismiss();
            await harness.fixture.whenStable();

            expect(snackBarText()).toBeUndefined();
        });

        it("should hide the error and redirect to the login page when logging out again succeeds", async () => {
            authnApi.logOutResult = ok(undefined);

            clickLogOut();
            await waitForLogOut();

            expect(authnApi.logOutCount).toBe(2);
            expect(snackBarText()).toBeUndefined();
            expect(TestBed.inject(Router).url).toBe("/login");
        });

        it("should show the error again when logging out again fails", async () => {
            clickLogOut();
            await waitForLogOut();

            expect(authnApi.logOutCount).toBe(2);
            expect(snackBarText()).toContain("Couldn't log out");
        });
    });
});

/**
 * {@link AuthnApi} that records logout attempts and returns preconfigured results.
 */
class FakeAuthnApi implements AuthnApi {
    logOutCount = 0;
    logOutResult: Result<void, LogOutError> = ok(undefined);

    logInWithGitHub(): void {
        throw new Error("not used by ConsoleScaffoldContainer");
    }

    async logOut(): Promise<Result<void, LogOutError>> {
        this.logOutCount++;
        return this.logOutResult;
    }
}
