// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { inputBinding, outputBinding, signal, type WritableSignal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { MatSidenav } from "@angular/material/sidenav";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";

import { HANDSET } from "../../tokens";
import type { LoadingButtonState } from "../loading-button/loading-button";
import { ConsoleScaffoldPage } from "./console-scaffold-page";

describe("ConsoleScaffoldPage", () => {
    let handset: WritableSignal<boolean>;
    let logoutState: WritableSignal<LoadingButtonState>;
    let logOutCount: number;

    /**
     * Creates a {@link ConsoleScaffoldPage} and waits for it to render.
     */
    async function render(isHandset: boolean): Promise<ComponentFixture<ConsoleScaffoldPage>> {
        handset = signal(isHandset);
        TestBed.configureTestingModule({
            imports: [ConsoleScaffoldPage],
            providers: [
                // Accept any URL so that navigation items can be clicked
                provideRouter([{ path: "**", children: [] }]),
                { provide: HANDSET, useValue: handset },
            ],
        });

        logoutState = signal<LoadingButtonState>("idle");
        logOutCount = 0;
        const fixture = TestBed.createComponent(ConsoleScaffoldPage, {
            bindings: [
                inputBinding("logoutState", logoutState),
                outputBinding("logOut", () => logOutCount++),
            ],
        });
        await fixture.whenStable();
        return fixture;
    }

    function logOutButton(fixture: ComponentFixture<ConsoleScaffoldPage>): HTMLButtonElement {
        return fixture.nativeElement.querySelector("acc-loading-button button");
    }

    function menuButton(fixture: ComponentFixture<ConsoleScaffoldPage>): HTMLButtonElement | null {
        return fixture.nativeElement.querySelector("button[aria-label='Toggle navigation']");
    }

    function sidenav(fixture: ComponentFixture<ConsoleScaffoldPage>): MatSidenav {
        return fixture.debugElement.query(By.directive(MatSidenav)).injector.get(MatSidenav);
    }

    describe("on a large screen", () => {
        let fixture: ComponentFixture<ConsoleScaffoldPage>;

        beforeEach(async () => {
            fixture = await render(false);
        });

        it("should not show the menu button", () => {
            expect(menuButton(fixture)).toBeNull();
        });
    });

    describe("on a handset", () => {
        let fixture: ComponentFixture<ConsoleScaffoldPage>;

        beforeEach(async () => {
            fixture = await render(true);
        });

        it("should hide the sidebar by default", () => {
            expect(sidenav(fixture).opened).toBe(false);
        });

        it("should toggle the sidebar when the menu button is clicked", async () => {
            menuButton(fixture)!.click();
            await fixture.whenStable();
            expect(sidenav(fixture).opened).toBe(true);

            menuButton(fixture)!.click();
            await fixture.whenStable();
            expect(sidenav(fixture).opened).toBe(false);
        });

        it("should show a close icon in the menu button while the sidebar is open", async () => {
            expect(menuButton(fixture)!.textContent?.trim()).toBe("menu");

            menuButton(fixture)!.click();
            await fixture.whenStable();
            expect(menuButton(fixture)!.textContent?.trim()).toBe("close");

            menuButton(fixture)!.click();
            await fixture.whenStable();
            expect(menuButton(fixture)!.textContent?.trim()).toBe("menu");
        });

        it("should hide the sidebar when a navigation item is clicked", async () => {
            menuButton(fixture)!.click();
            await fixture.whenStable();

            fixture.nativeElement.querySelector("mat-sidenav a").click();
            await fixture.whenStable();

            expect(sidenav(fixture).opened).toBe(false);
        });

        it("should show the sidebar and hide the menu button when the screen becomes large", async () => {
            handset.set(false);
            await fixture.whenStable();

            expect(sidenav(fixture).opened).toBe(true);
            expect(menuButton(fixture)).toBeNull();
        });
    });

    describe("log out button", () => {
        let fixture: ComponentFixture<ConsoleScaffoldPage>;

        beforeEach(async () => {
            fixture = await render(false);
        });

        it("should emit logOut when clicked", () => {
            logOutButton(fixture).click();

            expect(logOutCount).toBe(1);
        });

        describe("when logout is pending", () => {
            beforeEach(async () => {
                logoutState.set("pending");
                await fixture.whenStable();
            });

            it("should not show a progress indicator", () => {
                expect(logOutButton(fixture).querySelector("mat-progress-spinner")).toBeNull();
            });

            it("should not emit logOut when clicked", () => {
                logOutButton(fixture).click();

                expect(logOutCount).toBe(0);
            });
        });

        describe("when logging out", () => {
            beforeEach(async () => {
                logoutState.set("loading");
                await fixture.whenStable();
            });

            it("should show a progress indicator", () => {
                expect(logOutButton(fixture).querySelector("mat-progress-spinner")).not.toBeNull();
            });

            it("should have an accessible name describing the logout in progress", () => {
                expect(logOutButton(fixture).getAttribute("aria-label")).toBe("Logging out");
            });
        });
    });
});
