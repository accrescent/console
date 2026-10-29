// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import {
    ApplicationRef,
    inputBinding,
    outputBinding,
    signal,
    type WritableSignal,
} from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { MATERIAL_ANIMATIONS } from "@angular/material/core";
import {
    type AppDraftEditorDeleteAppDraftError,
    AppDraftEditorPage,
    type AppDraftEditorPageState,
} from "./app-draft-editor-page";

const IDLE: AppDraftEditorPageState = { deleteAppDraftState: "idle" };

describe("AppDraftEditorPage", () => {
    let pageState: WritableSignal<AppDraftEditorPageState>;
    let deleteCount: number;
    let dismissCount: number;
    let fixture: ComponentFixture<AppDraftEditorPage>;

    beforeEach(async () => {
        // Open and close the dialog immediately instead of waiting for animations
        TestBed.configureTestingModule({
            providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
        });
        pageState = signal(IDLE);
        deleteCount = 0;
        dismissCount = 0;
        fixture = TestBed.createComponent(AppDraftEditorPage, {
            bindings: [
                inputBinding("state", pageState),
                outputBinding("deleteAppDraft", () => deleteCount++),
                outputBinding("dismissDeleteAppDraftError", () => dismissCount++),
            ],
        });
        await fixture.whenStable();
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

    it("should show the delete dialog when the delete button is clicked", async () => {
        await openDeleteDialog();

        expect(dialog()?.textContent).toContain("Delete app draft?");
    });

    describe("when the delete dialog is open", () => {
        beforeEach(async () => {
            await openDeleteDialog();
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
            ["permissionDenied", "You don't have permission to delete this app draft."],
            ["unavailable", "This isn't caused by anything you did."],
        ] as const)("should explain a %s error deleting the app draft", async (kind, message) => {
            await setState({ ...IDLE, deleteAppDraftError: { kind, failedAttempts: 1 } });

            const alert: HTMLElement = dialog()!.querySelector("acc-error-alert")!;
            expect(alert.textContent).toContain("Couldn't delete app draft");
            expect(text(alert)).toContain(message);
        });

        describe("while deleting", () => {
            beforeEach(async () => {
                await setState({ deleteAppDraftState: "loading" });
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
