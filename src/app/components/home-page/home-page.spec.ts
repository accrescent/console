// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { inputBinding, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { HomePage, type HomePageState } from "./home-page";

describe("HomePage", () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomePage],
        }).compileComponents();
    });

    /**
     * Creates a {@link HomePage} in the given state and waits for it to render.
     */
    async function render(state: HomePageState): Promise<ComponentFixture<HomePage>> {
        const fixture = TestBed.createComponent(HomePage, {
            bindings: [inputBinding("state", signal(state))],
        });
        await fixture.whenStable();
        return fixture;
    }

    describe("when loading", () => {
        let fixture: ComponentFixture<HomePage>;

        beforeEach(async () => {
            fixture = await render({ kind: "loading" });
        });

        it("should show a progress indicator", () => {
            expect(fixture.nativeElement.querySelector("mat-progress-spinner")).not.toBeNull();
        });
    });

    describe("when loading failed", () => {
        let fixture: ComponentFixture<HomePage>;

        beforeEach(async () => {
            fixture = await render({
                kind: "error",
                error: { kind: "unavailable", resource: { kind: "console" } },
            });
        });

        it("should show an error", () => {
            const alert: HTMLElement = fixture.nativeElement.querySelector("[role=alert]");
            expect(alert.textContent).toContain("Something went wrong");
        });
    });
});
