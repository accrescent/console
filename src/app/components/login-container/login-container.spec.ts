// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { ok, type Result } from "../../../core/result";
import type { AuthnApi } from "../../../domain/ports/authn/authn-api";
import type { LogOutError } from "../../../domain/ports/authn/errors";
import { AUTHN_API } from "../../tokens";
import { LoginContainer } from "./login-container";

describe("LoginContainer", () => {
    let fixture: ComponentFixture<LoginContainer>;
    let authnApi: FakeAuthnApi;

    beforeEach(async () => {
        authnApi = new FakeAuthnApi();
        await TestBed.configureTestingModule({
            imports: [LoginContainer],
            providers: [{ provide: AUTHN_API, useValue: authnApi }],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginContainer);
        await fixture.whenStable();
    });

    it("should render the login page", () => {
        expect(fixture.nativeElement.querySelector("acc-login-page")).not.toBeNull();
    });

    it("should start the GitHub login flow when login is clicked", () => {
        fixture.nativeElement.querySelector("button").click();

        expect(authnApi.gitHubLoginCount).toBe(1);
    });

    it("should show the login page as loading after login is clicked", async () => {
        fixture.nativeElement.querySelector("button").click();
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector("mat-progress-spinner")).not.toBeNull();
    });

    it("should stop loading when restored from the back/forward cache", async () => {
        fixture.nativeElement.querySelector("button").click();
        await fixture.whenStable();

        window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector("mat-progress-spinner")).toBeNull();
    });

    it("should keep loading on a pageshow not from the back/forward cache", async () => {
        fixture.nativeElement.querySelector("button").click();
        await fixture.whenStable();

        window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: false }));
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector("mat-progress-spinner")).not.toBeNull();
    });
});

/**
 * {@link AuthnApi} that records login attempts instead of leaving the page.
 */
class FakeAuthnApi implements AuthnApi {
    gitHubLoginCount = 0;

    logInWithGitHub(): void {
        this.gitHubLoginCount++;
    }

    async logOut(): Promise<Result<void, LogOutError>> {
        return ok(undefined);
    }
}
