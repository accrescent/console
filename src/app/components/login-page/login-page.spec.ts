// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { inputBinding, outputBinding, signal, type WritableSignal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { LoginPage } from "./login-page";

describe("LoginPage", () => {
    let fixture: ComponentFixture<LoginPage>;
    let loading: WritableSignal<boolean>;
    let loginCount: number;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginPage],
        }).compileComponents();

        loading = signal(false);
        loginCount = 0;
        fixture = TestBed.createComponent(LoginPage, {
            bindings: [
                inputBinding("loading", loading),
                outputBinding("login", () => loginCount++),
            ],
        });
        await fixture.whenStable();
    });

    it("should display the login button text", () => {
        const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
        expect(button.textContent?.trim()).toBe("Log in with GitHub");
    });

    it("should emit login when the login button is clicked", () => {
        fixture.nativeElement.querySelector("button").click();

        expect(loginCount).toBe(1);
    });

    describe("when loading", () => {
        beforeEach(async () => {
            loading.set(true);
            await fixture.whenStable();
        });

        it("should show a progress indicator", () => {
            expect(fixture.nativeElement.querySelector("mat-progress-spinner")).not.toBeNull();
        });

        it("should disable the login button but keep it focusable", () => {
            const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");

            expect(button.disabled).toBe(false);
            expect(button.getAttribute("aria-disabled")).toBe("true");
        });

        it("should give the login button an accessible name describing the login in progress", () => {
            const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
            expect(button.getAttribute("aria-label")).toBe("Logging in with GitHub");
        });

        it("should not emit login when the login button is clicked", () => {
            fixture.nativeElement.querySelector("button").click();

            expect(loginCount).toBe(0);
        });
    });
});
