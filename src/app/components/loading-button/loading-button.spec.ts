// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import type { MatButtonAppearance } from "@angular/material/button";
import { LoadingButton } from "./loading-button";

@Component({
    imports: [LoadingButton],
    template: `
        <acc-loading-button
            [appearance]="appearance()"
            [loading]="loading()"
            loadingLabel="Saving"
            (press)="pressCount = pressCount + 1">
            <span class="label">Save</span>
        </acc-loading-button>
    `,
})
class Host {
    readonly appearance = signal<MatButtonAppearance>("text");
    readonly loading = signal(false);
    pressCount = 0;
}

describe("LoadingButton", () => {
    let fixture: ComponentFixture<Host>;

    beforeEach(async () => {
        fixture = TestBed.createComponent(Host);
        await fixture.whenStable();
    });

    function button(): HTMLButtonElement {
        return fixture.nativeElement.querySelector("button");
    }

    it("should show the label in the button", () => {
        expect(button().textContent).toContain("Save");
    });

    it("should apply the appearance to the button", async () => {
        fixture.componentInstance.appearance.set("filled");
        await fixture.whenStable();

        expect(button().classList).toContain("mat-mdc-unelevated-button");
    });

    describe("when not loading", () => {
        it("should not show a progress indicator", () => {
            expect(button().querySelector("mat-progress-spinner")).toBeNull();
        });

        it("should enable the button", () => {
            expect(button().disabled).toBe(false);
            expect(button().getAttribute("aria-disabled")).toBeNull();
        });

        it("should name the button by its label", () => {
            expect(button().getAttribute("aria-label")).toBeNull();
        });

        it("should emit press when clicked", () => {
            button().click();

            expect(fixture.componentInstance.pressCount).toBe(1);
        });
    });

    describe("when loading", () => {
        beforeEach(async () => {
            fixture.componentInstance.loading.set(true);
            await fixture.whenStable();
        });

        it("should show a progress indicator in the button", () => {
            expect(button().querySelector("mat-progress-spinner")).not.toBeNull();
        });

        it("should disable the button but keep it focusable", () => {
            expect(button().disabled).toBe(false);
            expect(button().getAttribute("aria-disabled")).toBe("true");
        });

        it("should give the button an accessible name describing the action in progress", () => {
            expect(button().getAttribute("aria-label")).toBe("Saving");
        });

        it("should not emit press when clicked", () => {
            button().click();

            expect(fixture.componentInstance.pressCount).toBe(0);
        });

        it("should not emit press when the label is clicked", () => {
            fixture.nativeElement.querySelector(".label").click();

            expect(fixture.componentInstance.pressCount).toBe(0);
        });

        it("should emit press again once loading finishes", async () => {
            fixture.componentInstance.loading.set(false);
            await fixture.whenStable();

            button().click();

            expect(fixture.componentInstance.pressCount).toBe(1);
        });
    });
});
