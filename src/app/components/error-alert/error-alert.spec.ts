// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { inputBinding, outputBinding, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { ErrorAlert } from "./error-alert";

describe("ErrorAlert", () => {
    const heading = signal("Couldn't save");
    const failedAttempts = signal(1);
    let dismissCount: number;
    let fixture: ComponentFixture<ErrorAlert>;

    beforeEach(async () => {
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
        heading.set("Couldn't save");
        failedAttempts.set(1);
        dismissCount = 0;
        fixture = TestBed.createComponent(ErrorAlert, {
            bindings: [
                inputBinding("heading", heading),
                inputBinding("message", () => "Please try again in a few minutes."),
                inputBinding("failedAttempts", failedAttempts),
                outputBinding("dismiss", () => dismissCount++),
            ],
        });
        await fixture.whenStable();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function text(): string {
        return fixture.nativeElement.textContent.replace(/\s+/g, " ");
    }

    function announcement(): string | undefined {
        return document.querySelector(".cdk-live-announcer-element")?.textContent;
    }

    it("should show the heading and message", () => {
        expect(text()).toContain("Couldn't save");
        expect(text()).toContain("Please try again in a few minutes.");
    });

    it("should not show failed attempts when only one attempt has failed", () => {
        expect(text()).not.toContain("Failed attempts");
    });

    it("should show how many attempts have failed when another attempt fails", async () => {
        failedAttempts.set(2);
        await fixture.whenStable();

        expect(text()).toContain("Failed attempts: 2");
    });

    it("should announce the heading and message", () => {
        vi.runAllTimers();

        expect(announcement()).toBe("Couldn't save. Please try again in a few minutes.");
    });

    it("should announce the alert again when another attempt fails", async () => {
        failedAttempts.set(2);
        await fixture.whenStable();
        vi.runAllTimers();

        expect(announcement()).toBe(
            "Couldn't save. Please try again in a few minutes. Failed attempts: 2.",
        );
    });

    it("should announce the alert again when the heading changes", async () => {
        heading.set("Couldn't delete");
        await fixture.whenStable();
        vi.runAllTimers();

        expect(announcement()).toBe("Couldn't delete. Please try again in a few minutes.");
    });

    it("should emit dismiss when the dismiss button is clicked", () => {
        fixture.nativeElement.querySelector("button[aria-label=Dismiss]").click();

        expect(dismissCount).toBe(1);
    });
});
