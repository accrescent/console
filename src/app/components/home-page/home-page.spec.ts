// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { inputBinding, outputBinding, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { HomePage, HomePageState } from "./home-page";

describe("HomePage", () => {
    let reloadCount: number;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomePage],
        }).compileComponents();

        reloadCount = 0;
    });

    /**
     * Creates a {@link HomePage} in the given state and waits for it to render.
     */
    async function render(state: HomePageState): Promise<ComponentFixture<HomePage>> {
        const fixture = TestBed.createComponent(HomePage, {
            bindings: [
                inputBinding("state", signal(state)),
                outputBinding("reload", () => reloadCount++),
            ],
        });
        await fixture.whenStable();
        return fixture;
    }

    describe("when loading", () => {
        let fixture: ComponentFixture<HomePage>;

        beforeEach(async () => {
            fixture = await render(HomePageState.Loading);
        });

        it("should show a progress indicator", () => {
            expect(fixture.nativeElement.querySelector("mat-progress-spinner")).not.toBeNull();
        });
    });

    describe("when loading failed", () => {
        let fixture: ComponentFixture<HomePage>;

        beforeEach(async () => {
            fixture = await render(HomePageState.LoadingFailed);
        });

        it("should show an error", () => {
            const alert: HTMLElement = fixture.nativeElement.querySelector("[role=alert]");
            expect(alert.textContent).toContain("Something went wrong");
        });

        it("should emit reload when the reload button is clicked", () => {
            fixture.nativeElement.querySelector("button").click();

            expect(reloadCount).toBe(1);
        });
    });

    describe("when reloading", () => {
        let fixture: ComponentFixture<HomePage>;

        beforeEach(async () => {
            fixture = await render(HomePageState.Reloading);
        });

        it("should show an error", () => {
            const alert: HTMLElement = fixture.nativeElement.querySelector("[role=alert]");
            expect(alert.textContent).toContain("Something went wrong");
        });

        it("should show a progress indicator in the reload button", () => {
            const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
            expect(button.querySelector("mat-progress-spinner")).not.toBeNull();
        });

        it("should disable the reload button but keep it focusable", () => {
            const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");

            expect(button.disabled).toBe(false);
            expect(button.getAttribute("aria-disabled")).toBe("true");
        });

        it("should give the reload button an accessible name describing the reload in progress", () => {
            const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
            expect(button.getAttribute("aria-label")).toBe("Trying again");
        });

        it("should not emit reload when the reload button is clicked", () => {
            fixture.nativeElement.querySelector("button").click();

            expect(reloadCount).toBe(0);
        });
    });
});
