// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import type { MatButtonAppearance } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatTooltipHarness } from "@angular/material/tooltip/testing";
import { By } from "@angular/platform-browser";

import { LoadingButton, type LoadingButtonState } from "./loading-button";

@Component({
    imports: [LoadingButton, MatIcon],
    template: `
        <acc-loading-button
            [appearance]="appearance()"
            [state]="state()"
            loadingLabel="Saving"
            [disabledReason]="disabledReason()"
            (press)="pressCount = pressCount + 1">
            <mat-icon>save</mat-icon>
            <span matButtonIcon class="icon"></span>
            <span class="label">Save</span>
        </acc-loading-button>
    `,
})
class Host {
    readonly appearance = signal<MatButtonAppearance>("text");
    readonly state = signal<LoadingButtonState>("idle");
    readonly disabledReason = signal<string | undefined>(undefined);
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

    it.each([
        ["matButtonIcon content", ".icon"],
        ["a mat-icon", "mat-icon"],
    ])(
        "should show %s in the button as an icon rather than as part of the label",
        (_, selector) => {
            const icon: HTMLElement = button().querySelector(selector)!;

            expect(icon).not.toBeNull();
            expect(icon.closest(".mdc-button__label")).toBeNull();
        },
    );

    it("should focus the button when focus() is called", () => {
        fixture.debugElement.query(By.directive(LoadingButton)).componentInstance.focus();

        expect(document.activeElement).toBe(button());
    });

    it("should apply the appearance to the button", async () => {
        fixture.componentInstance.appearance.set("filled");
        await fixture.whenStable();

        expect(button().classList).toContain("mat-mdc-unelevated-button");
    });

    describe("when idle", () => {
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

    describe("when pending", () => {
        beforeEach(async () => {
            fixture.componentInstance.state.set("pending");
            await fixture.whenStable();
        });

        it("should not show a progress indicator", () => {
            expect(button().querySelector("mat-progress-spinner")).toBeNull();
        });

        it("should disable the button but keep it focusable", () => {
            expect(button().disabled).toBe(false);
            expect(button().getAttribute("aria-disabled")).toBe("true");
        });

        it("should name the button by its label", () => {
            expect(button().getAttribute("aria-label")).toBeNull();
        });

        it("should not emit press when clicked", () => {
            button().click();

            expect(fixture.componentInstance.pressCount).toBe(0);
        });
    });

    describe("when loading", () => {
        beforeEach(async () => {
            fixture.componentInstance.state.set("loading");
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

        it("should emit press again once the action finishes", async () => {
            fixture.componentInstance.state.set("idle");
            await fixture.whenStable();

            button().click();

            expect(fixture.componentInstance.pressCount).toBe(1);
        });
    });

    describe("when disabled with a reason", () => {
        beforeEach(async () => {
            fixture.componentInstance.disabledReason.set("Nothing to save");
            await fixture.whenStable();
        });

        it("should disable the button but keep it focusable", () => {
            expect(button().disabled).toBe(false);
            expect(button().getAttribute("aria-disabled")).toBe("true");
        });

        it("should explain why the button is disabled", async () => {
            const tooltip =
                await TestbedHarnessEnvironment.loader(fixture).getHarness(MatTooltipHarness);
            await tooltip.show();

            expect(await tooltip.getTooltipText()).toBe("Nothing to save");
        });

        it("should not emit press when clicked", () => {
            button().click();

            expect(fixture.componentInstance.pressCount).toBe(0);
        });
    });
});
