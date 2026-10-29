// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { inputBinding, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { MatProgressBarHarness } from "@angular/material/progress-bar/testing";

import { QuotaCard } from "./quota-card";

describe("QuotaCard", () => {
    /**
     * Creates a {@link QuotaCard} with the given usage and waits for it to render.
     */
    async function render(count: number, limit: number): Promise<ComponentFixture<QuotaCard>> {
        const fixture = TestBed.createComponent(QuotaCard, {
            bindings: [
                inputBinding("label", signal("Published apps")),
                inputBinding("description", signal("Apps available in the store")),
                inputBinding("icon", signal("apps")),
                inputBinding("count", signal(count)),
                inputBinding("limit", signal(limit)),
                inputBinding(
                    "fullAction",
                    signal("Check back later for a way to increase this limit."),
                ),
            ],
        });
        await fixture.whenStable();
        return fixture;
    }

    function text(fixture: ComponentFixture<QuotaCard>): string {
        return fixture.nativeElement.textContent.replace(/\s+/g, " ");
    }

    async function meterValue(fixture: ComponentFixture<QuotaCard>): Promise<number | null> {
        const meter =
            await TestbedHarnessEnvironment.loader(fixture).getHarness(MatProgressBarHarness);
        return meter.getValue();
    }

    it("should show the label", async () => {
        const fixture = await render(3, 10);

        expect(fixture.nativeElement.querySelector("h3").textContent).toContain("Published apps");
    });

    it("should show the usage out of the limit", async () => {
        const fixture = await render(3, 10);

        expect(text(fixture)).toContain("3 of 10");
    });

    it("should fill the meter in proportion to the usage", async () => {
        const fixture = await render(3, 10);

        expect(await meterValue(fixture)).toBe(30);
    });

    it("should note when nearly full", async () => {
        const fixture = await render(9, 10);

        expect(text(fixture)).toContain("Almost full");
        expect(text(fixture)).not.toContain("Check back later");
    });

    it("should show that the limit is reached when full", async () => {
        const fixture = await render(10, 10);

        expect(text(fixture)).toContain("Limit reached");
        expect(await meterValue(fixture)).toBe(100);
    });

    it("should suggest the full action when full", async () => {
        const fixture = await render(10, 10);

        expect(text(fixture)).toContain("Check back later for a way to increase this limit.");
    });

    it("should not overfill the meter when the usage exceeds the limit", async () => {
        const fixture = await render(12, 10);

        expect(text(fixture)).toContain("Limit reached");
        expect(await meterValue(fixture)).toBe(100);
    });

    it("should show a zero limit as full", async () => {
        const fixture = await render(0, 0);

        expect(text(fixture)).toContain("Limit reached");
        expect(await meterValue(fixture)).toBe(100);
    });
});
