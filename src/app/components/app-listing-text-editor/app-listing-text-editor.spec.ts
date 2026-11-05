// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { inputBinding, outputBinding, signal, type WritableSignal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import {
    LISTING_NAME_MAX_LENGTH,
    LISTING_SHORT_DESCRIPTION_MAX_LENGTH,
    type AppListingText,
} from "../../../domain/app-listing";
import type { LoadingButtonState } from "../loading-button/loading-button";
import { AppListingTextEditor, type AppListingTextSaveError } from "./app-listing-text-editor";

const LISTING: AppListingText = { name: "Weather", shortDescription: "The weather" };

describe("AppListingTextEditor", () => {
    let listing: WritableSignal<AppListingText | undefined>;
    let saveState: WritableSignal<LoadingButtonState>;
    let saveError: WritableSignal<AppListingTextSaveError | undefined>;
    let reloadState: WritableSignal<LoadingButtonState>;
    let saved: AppListingText[];
    let dismissCount: number;
    let reloadCount: number;
    let fixture: ComponentFixture<AppListingTextEditor>;

    beforeEach(async () => {
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
        listing = signal(undefined);
        saveState = signal("idle");
        saveError = signal(undefined);
        reloadState = signal("idle");
        saved = [];
        dismissCount = 0;
        reloadCount = 0;
        fixture = TestBed.createComponent(AppListingTextEditor, {
            bindings: [
                inputBinding("listing", listing),
                inputBinding("saveState", saveState),
                inputBinding("saveError", saveError),
                inputBinding("reloadState", reloadState),
                outputBinding<AppListingText>("save", (value) => saved.push(value)),
                outputBinding("dismissSaveError", () => dismissCount++),
                outputBinding("reload", () => reloadCount++),
            ],
        });
        await fixture.whenStable();
    });

    function nameInput(): HTMLInputElement {
        return fixture.nativeElement.querySelector("input");
    }

    function shortDescriptionInput(): HTMLInputElement {
        return fixture.nativeElement.querySelector("mat-form-field:nth-of-type(3) input");
    }

    function saveButton(): HTMLButtonElement {
        return fixture.nativeElement.querySelector("form > div acc-loading-button button");
    }

    function reloadButton(): HTMLButtonElement | null {
        return fixture.nativeElement.querySelector("acc-error-alert acc-loading-button button");
    }

    function text(): string {
        return fixture.nativeElement.textContent.replace(/\s+/g, " ");
    }

    async function type(element: HTMLInputElement, value: string): Promise<void> {
        element.value = value;
        element.dispatchEvent(new Event("input"));
        await fixture.whenStable();
    }

    async function clickSave(): Promise<void> {
        saveButton().click();
        await fixture.whenStable();
    }

    it("should use a submit button so that pressing Enter in a field saves", () => {
        expect(saveButton().type).toBe("submit");
    });

    it("should start empty without a listing", () => {
        expect(nameInput().value).toBe("");
        expect(shortDescriptionInput().value).toBe("");
        expect(saveButton().textContent).toContain("Save listing");
    });

    it("should show how many characters each field uses", async () => {
        await type(nameInput(), "Weather");
        await type(shortDescriptionInput(), "The weather");

        expect(text()).toContain(`7 / ${LISTING_NAME_MAX_LENGTH}`);
        expect(text()).toContain(`11 / ${LISTING_SHORT_DESCRIPTION_MAX_LENGTH}`);
    });

    it("should count characters as code points", async () => {
        await type(nameInput(), "😀");
        await type(shortDescriptionInput(), "😀😀");

        expect(text()).toContain(`1 / ${LISTING_NAME_MAX_LENGTH}`);
        expect(text()).toContain(`2 / ${LISTING_SHORT_DESCRIPTION_MAX_LENGTH}`);
    });

    it("should not limit fields by UTF-16 code units when typing", () => {
        expect(nameInput().maxLength).toBe(-1);
        expect(shortDescriptionInput().maxLength).toBe(-1);
    });

    it("should emit the entered text when saved", async () => {
        await type(nameInput(), "Weather");
        await type(shortDescriptionInput(), "The weather");

        await clickSave();

        expect(saved).toEqual([{ name: "Weather", shortDescription: "The weather" }]);
    });

    it("should not emit when a required field is empty", async () => {
        await type(nameInput(), "Weather");

        await clickSave();

        expect(saved).toEqual([]);
    });

    it("should not emit when a field is too long", async () => {
        await type(nameInput(), "a".repeat(LISTING_NAME_MAX_LENGTH + 1));
        await type(shortDescriptionInput(), "The weather");

        await clickSave();

        expect(saved).toEqual([]);
    });

    describe("with a saved listing", () => {
        beforeEach(async () => {
            listing.set(LISTING);
            await fixture.whenStable();
        });

        it("should show the listing's text", () => {
            expect(nameInput().value).toBe("Weather");
            expect(shortDescriptionInput().value).toBe("The weather");
            expect(saveButton().textContent).toContain("Save changes");
        });

        it("should disable saving until the text changes", async () => {
            expect(saveButton().getAttribute("aria-disabled")).toBe("true");

            await type(nameInput(), "Weather 2");

            expect(saveButton().getAttribute("aria-disabled")).toBeNull();
        });

        it("should not emit when saved without changes", async () => {
            await clickSave();

            expect(saved).toEqual([]);
        });

        it("should not emit when saved after undoing edits", async () => {
            await type(nameInput(), "Weather 2");
            await type(nameInput(), "Weather");

            await clickSave();

            expect(saved).toEqual([]);
        });

        it("should emit when saved with changes", async () => {
            await type(nameInput(), "Weather 2");

            await clickSave();

            expect(saved).toEqual([{ name: "Weather 2", shortDescription: "The weather" }]);
        });

        it("should disable saving again once the edits are saved", async () => {
            await type(nameInput(), "Weather 2");

            listing.set({ ...LISTING, name: "Weather 2" });
            await fixture.whenStable();

            expect(nameInput().value).toBe("Weather 2");
            expect(saveButton().getAttribute("aria-disabled")).toBe("true");
        });
    });

    describe("when saving hasn't taken long enough to show progress", () => {
        beforeEach(async () => {
            await type(nameInput(), "Weather");
            await type(shortDescriptionInput(), "The weather");
            saveState.set("pending");
            await fixture.whenStable();
        });

        it("should block edits without looking disabled", () => {
            expect(nameInput().readOnly).toBe(true);
            expect(shortDescriptionInput().readOnly).toBe(true);
            expect(nameInput().disabled).toBe(false);
            expect(shortDescriptionInput().disabled).toBe(false);
        });

        it("should disable the save button", () => {
            expect(saveButton().getAttribute("aria-disabled")).toBe("true");
        });

        it("should not emit when saved again", async () => {
            await clickSave();

            expect(saved).toEqual([]);
        });
    });

    it("should disable the form once saving shows progress", async () => {
        saveState.set("loading");
        await fixture.whenStable();

        expect(nameInput().disabled).toBe(true);
        expect(shortDescriptionInput().disabled).toBe(true);
        expect(saveButton().getAttribute("aria-disabled")).toBe("true");
    });

    it("should allow edits again once saving finishes", async () => {
        saveState.set("loading");
        await fixture.whenStable();

        saveState.set("idle");
        await fixture.whenStable();

        expect(nameInput().disabled).toBe(false);
        expect(nameInput().readOnly).toBe(false);
    });

    describe("save errors", () => {
        async function setKind(kind: AppListingTextSaveError["kind"]): Promise<void> {
            saveError.set({ kind, failedAttempts: 1 });
            await fixture.whenStable();
        }

        it("should explain when the user isn't logged in", async () => {
            await setKind("unauthenticated");

            expect(text()).toContain("You're logged out.");
        });

        it("should link to the login page when the user isn't logged in", async () => {
            await setKind("unauthenticated");

            const link: HTMLAnchorElement =
                fixture.nativeElement.querySelector("acc-error-alert a");
            expect(link.textContent).toContain("Log in");
            expect(link.getAttribute("href")).toBe("/login");
        });

        it("should explain when the user lacks permission", async () => {
            await setKind("permissionDenied");

            expect(text()).toContain("You don't have permission to edit the listing");
        });

        it("should explain how to recover from a conflict", async () => {
            await setKind("conflict");

            expect(text()).toContain("Reload it to see the latest version");
        });

        it("should offer to reload the listing for a conflict", async () => {
            await setKind("conflict");

            expect(reloadButton()?.textContent).toContain("Reload listing");
        });

        it("should emit and focus the save button when reloading", async () => {
            await setKind("conflict");

            reloadButton()!.click();

            expect(reloadCount).toBe(1);
            expect(document.activeElement).toBe(saveButton());
        });

        it("should not emit reload while already reloading", async () => {
            await setKind("conflict");
            reloadState.set("pending");
            await fixture.whenStable();

            reloadButton()!.click();

            expect(reloadCount).toBe(0);
        });

        it("should not emit reload while saving", async () => {
            await setKind("conflict");
            saveState.set("pending");
            await fixture.whenStable();

            reloadButton()!.click();

            expect(reloadCount).toBe(0);
        });

        it("should block edits and saving while reloading", async () => {
            await type(nameInput(), "Weather");
            await type(shortDescriptionInput(), "The weather");
            await setKind("conflict");

            reloadState.set("pending");
            await fixture.whenStable();

            expect(nameInput().readOnly).toBe(true);
            expect(nameInput().disabled).toBe(false);
            await clickSave();
            expect(saved).toEqual([]);

            reloadState.set("loading");
            await fixture.whenStable();

            expect(nameInput().disabled).toBe(true);
            await clickSave();
            expect(saved).toEqual([]);
        });

        it("should emit and focus the save button when dismissed", async () => {
            await type(nameInput(), "Weather");
            await setKind("unavailable");

            fixture.nativeElement.querySelector("button[aria-label=Dismiss]").click();

            expect(dismissCount).toBe(1);
            expect(document.activeElement).toBe(saveButton());
        });
    });
});
