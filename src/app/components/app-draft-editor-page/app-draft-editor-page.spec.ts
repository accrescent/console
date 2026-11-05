// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import {
    ApplicationRef,
    inputBinding,
    outputBinding,
    signal,
    type WritableSignal,
} from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { MATERIAL_ANIMATIONS } from "@angular/material/core";
import { MatTooltipHarness } from "@angular/material/tooltip/testing";
import { provideRouter } from "@angular/router";

import type { AppListingText } from "../../../domain/app-listing";
import type { LoadingButtonState } from "../loading-button/loading-button";
import {
    type AppDraftEditorDeleteAppDraftError,
    AppDraftEditorPage,
    type AppDraftEditorPageLoaded,
    type AppDraftEditorPageState,
} from "./app-draft-editor-page";

const IDLE: AppDraftEditorPageLoaded = {
    kind: "loaded",
    saveListingState: "idle",
    reloadListingState: "idle",
    deleteAppDraftState: "idle",
};

describe("AppDraftEditorPage", () => {
    let pageState: WritableSignal<AppDraftEditorPageState>;
    let deleteCount: number;
    let dismissCount: number;
    let savedListings: AppListingText[];
    let dismissSaveErrorCount: number;
    let reloadListingCount: number;
    let fixture: ComponentFixture<AppDraftEditorPage>;

    beforeEach(async () => {
        // jsdom performs no layout, so fake element geometry so that the CDK considers the dialog's
        // buttons visible and focusable
        vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([
            new DOMRect(),
        ] as unknown as DOMRectList);
        // Open and close the dialog immediately instead of waiting for animations
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
            ],
        });
        pageState = signal(IDLE);
        deleteCount = 0;
        dismissCount = 0;
        savedListings = [];
        dismissSaveErrorCount = 0;
        reloadListingCount = 0;
        fixture = TestBed.createComponent(AppDraftEditorPage, {
            bindings: [
                inputBinding("state", pageState),
                outputBinding("deleteAppDraft", () => deleteCount++),
                outputBinding("dismissDeleteAppDraftError", () => dismissCount++),
                outputBinding<AppListingText>("saveListing", (listing) =>
                    savedListings.push(listing),
                ),
                outputBinding("dismissSaveListingError", () => dismissSaveErrorCount++),
                outputBinding("reloadListing", () => reloadListingCount++),
            ],
        });
        await fixture.whenStable();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    async function setState(state: AppDraftEditorPageState): Promise<void> {
        pageState.set(state);
        await fixture.whenStable();
    }

    async function openDeleteDialog(): Promise<void> {
        fixture.nativeElement.querySelector("main button").click();
        await fixture.whenStable();
    }

    function dialog(): HTMLElement | null {
        return document.querySelector("mat-dialog-container");
    }

    function dialogButton(label: string): HTMLButtonElement {
        const buttons: HTMLButtonElement[] = Array.from(
            dialog()!.querySelectorAll("mat-dialog-actions button"),
        );
        return buttons.find((button) => button.textContent?.includes(label))!;
    }

    function clickCancel(): void {
        dialogButton("Cancel").click();
    }

    function clickBackdrop(): void {
        document.querySelector<HTMLElement>(".cdk-overlay-backdrop")!.click();
    }

    function pressEscape(): void {
        document.body.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", keyCode: 27, bubbles: true }),
        );
    }

    function text(element: Element): string {
        return element.textContent?.replace(/\s+/g, " ") ?? "";
    }

    describe("while loading", () => {
        function spinner(): HTMLElement | null {
            return fixture.nativeElement.querySelector("mat-progress-spinner");
        }

        it("should show progress when loading takes long enough", async () => {
            await setState({ kind: "loading" });

            expect(spinner()).not.toBeNull();
        });
    });

    it("should show an error when loading fails", async () => {
        await setState({
            kind: "error",
            error: { kind: "unavailable", resource: { kind: "appDraft", id: "draft-123" } },
        });

        expect(fixture.nativeElement.textContent).toContain("draft-123");
        expect(fixture.nativeElement.querySelector("mat-stepper")).toBeNull();
    });

    describe("progress", () => {
        it("should show that no steps are complete without a listing", () => {
            expect(fixture.nativeElement.textContent).toContain("0 of 3 steps complete");
        });

        it("should count the listing step as complete with a listing", async () => {
            await setState({
                ...IDLE,
                listing: { name: "Weather", shortDescription: "The weather" },
            });

            expect(fixture.nativeElement.textContent).toContain("1 of 3 steps complete");
        });
    });

    describe("listing editor", () => {
        function input(selector: string, value: string): void {
            const element: HTMLInputElement = fixture.nativeElement.querySelector(
                `acc-app-listing-text-editor ${selector}`,
            );
            element.value = value;
            element.dispatchEvent(new Event("input"));
        }

        it("should emit the listing when saved", async () => {
            input("input", "Weather");
            input("mat-form-field:nth-of-type(3) input", "The weather");
            await fixture.whenStable();

            fixture.nativeElement
                .querySelector("acc-app-listing-text-editor acc-loading-button button")
                .click();
            await fixture.whenStable();

            expect(savedListings).toEqual([{ name: "Weather", shortDescription: "The weather" }]);
        });

        it("should forward dismissing the save error", async () => {
            await setState({
                ...IDLE,
                saveListingError: { kind: "unavailable", failedAttempts: 1 },
            });

            fixture.nativeElement
                .querySelector("acc-app-listing-text-editor button[aria-label=Dismiss]")
                .click();

            expect(dismissSaveErrorCount).toBe(1);
        });

        it("should forward reloading the listing", async () => {
            await setState({
                ...IDLE,
                saveListingError: { kind: "conflict", failedAttempts: 1 },
            });

            fixture.nativeElement
                .querySelector(
                    "acc-app-listing-text-editor acc-error-alert acc-loading-button button",
                )
                .click();

            expect(reloadListingCount).toBe(1);
        });
    });

    describe("stepper", () => {
        function currentStepHeader(): HTMLElement {
            return fixture.nativeElement.querySelector("[aria-current=step]");
        }

        function currentStepButton(label: string): HTMLButtonElement | undefined {
            const content = document.getElementById(
                currentStepHeader().getAttribute("aria-controls")!,
            )!;
            const buttons: HTMLButtonElement[] = Array.from(content.querySelectorAll("button"));
            return buttons.find((button) => button.textContent?.trim() === label);
        }

        async function clickCurrentStepButton(label: string): Promise<void> {
            currentStepButton(label)!.click();
            await fixture.whenStable();
        }

        it("should go to the next step when Next is clicked", async () => {
            await clickCurrentStepButton("Next");

            expect(currentStepHeader().textContent).toContain("Upload icon");
        });

        it("should go to the previous step when Back is clicked", async () => {
            await clickCurrentStepButton("Next");
            await clickCurrentStepButton("Back");

            expect(currentStepHeader().textContent).toContain("Add store listing");
        });
    });

    describe("submit button", () => {
        it("should be disabled but focusable", () => {
            const buttons: HTMLButtonElement[] = Array.from(
                fixture.nativeElement.querySelectorAll("main button"),
            );
            const submit = buttons.find((button) =>
                button.textContent?.includes("Submit for review"),
            );

            expect(submit?.disabled).toBe(false);
            expect(submit?.getAttribute("aria-disabled")).toBe("true");
        });

        it("should explain why it is disabled", async () => {
            const tooltip = await TestbedHarnessEnvironment.loader(fixture).getHarness(
                MatTooltipHarness.with({ selector: "[matTooltip^=Complete]" }),
            );
            await tooltip.show();

            expect(await tooltip.getTooltipText()).toBe(
                "Complete all steps to submit your app for review.",
            );
        });
    });

    it("should show the delete dialog when the delete button is clicked", async () => {
        await openDeleteDialog();

        expect(dialog()?.textContent).toContain("Delete app draft?");
    });

    describe("when the delete dialog is open", () => {
        beforeEach(async () => {
            await openDeleteDialog();
        });

        it("should initially focus the cancel button", () => {
            expect(document.activeElement).toBe(dialogButton("Cancel"));
        });

        it("should emit deleteAppDraft when the delete button is clicked", () => {
            dialogButton("Delete").click();

            expect(deleteCount).toBe(1);
        });

        it.each([
            ["the cancel button is clicked", clickCancel],
            ["escape is pressed", pressEscape],
            ["the backdrop is clicked", clickBackdrop],
        ])("should close the dialog when %s", async (_, close) => {
            close();
            await fixture.whenStable();

            expect(dialog()).toBeNull();
        });

        it.each<LoadingButtonState>(["idle", "pending", "loading"])(
            "should close the dialog when the page stops being loaded with deletion %s",
            async (deleteAppDraftState) => {
                await setState({ ...IDLE, deleteAppDraftState });

                await setState({
                    kind: "error",
                    error: { kind: "unavailable", resource: { kind: "appDraft", id: "draft-123" } },
                });

                expect(dialog()).toBeNull();
                expect(document.querySelector(".cdk-overlay-backdrop")).toBeNull();
            },
        );

        it("should emit dismissDeleteAppDraftError when the dialog closes", async () => {
            dialogButton("Cancel").click();
            await fixture.whenStable();

            expect(dismissCount).toBe(1);
        });

        it("should close the dialog without emitting when the page is destroyed", async () => {
            fixture.destroy();
            await TestBed.inject(ApplicationRef).whenStable();

            expect(dialog()).toBeNull();
            expect(dismissCount).toBe(0);
        });

        it.each([
            ["unauthenticated", "You're logged out."],
            ["permissionDenied", "You don't have permission to delete this app draft."],
            ["unavailable", "This isn't caused by anything you did."],
        ] as const)("should explain a %s error deleting the app draft", async (kind, message) => {
            await setState({ ...IDLE, deleteAppDraftError: { kind, failedAttempts: 1 } });

            const alert: HTMLElement = dialog()!.querySelector("acc-error-alert")!;
            expect(alert.textContent).toContain("Couldn't delete app draft");
            expect(text(alert)).toContain(message);
        });

        it("should link to the login page after an unauthenticated error deleting the app draft", async () => {
            await setState({
                ...IDLE,
                deleteAppDraftError: { kind: "unauthenticated", failedAttempts: 1 },
            });

            const link = dialog()!.querySelector<HTMLAnchorElement>("acc-error-alert a")!;
            expect(link.textContent).toContain("Log in");
            expect(link.getAttribute("href")).toBe("/login");
        });

        describe("while deleting", () => {
            beforeEach(async () => {
                await setState({ ...IDLE, deleteAppDraftState: "loading" });
            });

            it("should show progress", () => {
                expect(dialogButton("Delete").getAttribute("aria-label")).toBe(
                    "Deleting app draft",
                );
            });

            it("should not emit deleteAppDraft when the delete button is clicked", () => {
                dialogButton("Delete").click();

                expect(deleteCount).toBe(0);
            });

            it("should disable the cancel button", () => {
                expect(dialogButton("Cancel").getAttribute("aria-disabled")).toBe("true");
            });

            it.each([
                ["the cancel button is clicked", clickCancel],
                ["escape is pressed", pressEscape],
            ])("should keep the dialog open when %s", async (_, close) => {
                close();
                await fixture.whenStable();

                expect(dialog()).not.toBeNull();
            });

            it("should close the dialog when the page is destroyed", async () => {
                fixture.destroy();
                await TestBed.inject(ApplicationRef).whenStable();

                expect(dialog()).toBeNull();
            });
        });

        describe("when the error deleting the app draft is dismissed", () => {
            const error: AppDraftEditorDeleteAppDraftError = {
                kind: "unavailable",
                failedAttempts: 1,
            };

            beforeEach(async () => {
                await setState({ ...IDLE, deleteAppDraftError: error });
                dialog()!.querySelector<HTMLElement>("button[aria-label=Dismiss]")!.click();
            });

            it("should emit dismissDeleteAppDraftError", () => {
                expect(dismissCount).toBe(1);
            });

            it("should move focus to the delete button", () => {
                expect(document.activeElement).toBe(dialogButton("Delete"));
            });
        });
    });
});
