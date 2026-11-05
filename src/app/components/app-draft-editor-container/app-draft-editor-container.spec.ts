// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { inputBinding } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { MATERIAL_ANIMATIONS } from "@angular/material/core";
import { By } from "@angular/platform-browser";
import { provideRouter, Router } from "@angular/router";

import { err, ok, type Result } from "../../../core/result";
import { MIN_PROGRESS_MS, PROGRESS_DELAY_MS } from "../../../domain/delay";
import type { ConsoleApi } from "../../../domain/ports/console/console-api";
import type { CreateAppDraftListingTextRequest } from "../../../domain/ports/console/create-app-draft-listing-text-request";
import type { CreateAppDraftListingTextResponse } from "../../../domain/ports/console/create-app-draft-listing-text-response";
import type { CreateAppDraftResponse } from "../../../domain/ports/console/create-app-draft-response";
import type { DeleteAppDraftRequest } from "../../../domain/ports/console/delete-app-draft-request";
import type {
    CreateAppDraftError,
    CreateAppDraftListingTextError,
    DeleteAppDraftError,
    GetAppDraftDetailsError,
    GetMyOrganizationError,
    GetOrganizationError,
    GetSelfError,
    ListAppDraftSummariesError,
    UpdateAppDraftListingTextError,
} from "../../../domain/ports/console/errors";
import type { GetAppDraftDetailsRequest } from "../../../domain/ports/console/get-app-draft-details-request";
import type { GetAppDraftDetailsResponse } from "../../../domain/ports/console/get-app-draft-details-response";
import type { GetMyOrganizationResponse } from "../../../domain/ports/console/get-my-organization-response";
import type { GetOrganizationResponse } from "../../../domain/ports/console/get-organization-response";
import type { GetSelfResponse } from "../../../domain/ports/console/get-self-response";
import type { ListAppDraftSummariesResponse } from "../../../domain/ports/console/list-app-draft-summaries-response";
import type { UpdateAppDraftListingTextRequest } from "../../../domain/ports/console/update-app-draft-listing-text-request";
import type { UpdateAppDraftListingTextResponse } from "../../../domain/ports/console/update-app-draft-listing-text-response";
import { CONSOLE_API } from "../../tokens";
import type { AppDraftEditorContentState } from "../app-draft-editor-content/app-draft-editor-content";
import {
    AppDraftEditorPage,
    type AppDraftEditorPageState,
} from "../app-draft-editor-page/app-draft-editor-page";
import { AppDraftEditorContainer } from "./app-draft-editor-container";

const ORGANIZATION_ID = "org-123";
const APP_DRAFT_ID = "draft-123";
const LISTING_TEXT = { name: "Weather", shortDescription: "The weather", etag: "etag-1" };

describe("AppDraftEditorContainer", () => {
    let consoleApi: FakeConsoleApi;
    let fixture: ComponentFixture<AppDraftEditorContainer>;

    /**
     * Creates the container, which starts loading the app draft.
     */
    function createContainer(): void {
        TestBed.configureTestingModule({
            providers: [
                // Accept any URL so that tests can check where the container navigated to
                provideRouter([{ path: "**", children: [] }]),
                { provide: CONSOLE_API, useValue: consoleApi },
                // Open and close the dialog immediately instead of waiting for animations
                { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
            ],
        });
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

        fixture = TestBed.createComponent(AppDraftEditorContainer, {
            bindings: [
                inputBinding("orgId", () => ORGANIZATION_ID),
                inputBinding("appDraftId", () => APP_DRAFT_ID),
            ],
        });
    }

    beforeEach(async () => {
        consoleApi = new FakeConsoleApi();
        // jsdom performs no layout, so fake element geometry so that the CDK considers the dialog's
        // buttons visible and focusable
        vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([
            new DOMRect(),
        ] as unknown as DOMRectList);
        createContainer();
        await settle();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    async function settle(): Promise<void> {
        await vi.runAllTimersAsync();
        await fixture.whenStable();
    }

    function anyPageState(): AppDraftEditorPageState {
        fixture.detectChanges();
        return fixture.debugElement
            .query(By.directive(AppDraftEditorPage))
            .injector.get(AppDraftEditorPage)
            .state();
    }

    function pageState(): AppDraftEditorContentState {
        const state = anyPageState();
        if (state.kind !== "loaded") {
            throw new Error(`expected the page to be loaded, but it was ${state.kind}`);
        }
        return state.value;
    }

    function dialogButton(label: string): HTMLButtonElement {
        fixture.detectChanges();
        const buttons: HTMLButtonElement[] = Array.from(
            document.querySelectorAll("mat-dialog-container mat-dialog-actions button"),
        );
        return buttons.find((button) => button.textContent?.includes(label))!;
    }

    async function openDeleteDialog(): Promise<void> {
        fixture.nativeElement.querySelector("acc-app-draft-editor-page main button").click();
        await settle();
    }

    function clickDismiss(): void {
        document
            .querySelector<HTMLElement>("mat-dialog-container button[aria-label=Dismiss]")!
            .click();
    }

    function nameInput(): HTMLInputElement {
        return fixture.nativeElement.querySelector("acc-app-listing-text-editor input");
    }

    function shortDescriptionInput(): HTMLInputElement {
        return fixture.nativeElement.querySelector(
            "acc-app-listing-text-editor mat-form-field:nth-of-type(3) input",
        );
    }

    function type(element: HTMLInputElement, value: string): void {
        element.value = value;
        element.dispatchEvent(new Event("input"));
    }

    function clickSave(): void {
        fixture.detectChanges();
        fixture.nativeElement
            .querySelector("acc-app-listing-text-editor form > div acc-loading-button button")
            .click();
    }

    function clickReload(): void {
        fixture.detectChanges();
        fixture.nativeElement
            .querySelector("acc-app-listing-text-editor acc-error-alert acc-loading-button button")
            .click();
    }

    /**
     * Fills in the listing form and requests saving it, waiting for saving to finish.
     */
    async function saveListing(name: string, shortDescription: string): Promise<void> {
        fixture.detectChanges();
        type(nameInput(), name);
        type(shortDescriptionInput(), shortDescription);
        clickSave();
        await settle();
    }

    it("should be idle initially", () => {
        expect(pageState().deleteAppDraftState).toBe("idle");
        expect(pageState().saveListingState).toBe("idle");
    });

    describe("when loading the app draft", () => {
        beforeEach(() => {
            TestBed.resetTestingModule();
            consoleApi = new FakeConsoleApi();
        });

        async function load(): Promise<void> {
            createContainer();
            await settle();
        }

        it("should request the app draft's details", async () => {
            await load();

            expect(consoleApi.getAppDraftDetailsRequests).toEqual([{ appDraftId: APP_DRAFT_ID }]);
        });

        it("should show progress only once loading takes long enough", async () => {
            consoleApi.getAppDraftDetailsDelayMs = PROGRESS_DELAY_MS + 1;
            createContainer();

            await vi.advanceTimersByTimeAsync(PROGRESS_DELAY_MS - 1);
            expect(anyPageState().kind).toBe("pending");

            await vi.advanceTimersByTimeAsync(1);
            expect(anyPageState().kind).toBe("loading");

            await settle();
            expect(anyPageState().kind).toBe("loaded");
        });

        it("should have no listing when the app draft has no listing text", async () => {
            await load();

            expect(pageState().listing).toBeUndefined();
        });

        it("should show the app draft's listing text", async () => {
            consoleApi.getAppDraftDetailsResult = ok({ listingText: LISTING_TEXT });

            await load();
            fixture.detectChanges();

            expect(nameInput().value).toBe("Weather");
            expect(shortDescriptionInput().value).toBe("The weather");
        });

        it("should redirect to the login page when unauthenticated", async () => {
            consoleApi.getAppDraftDetailsResult = err({ kind: "unauthenticated" });

            await load();

            expect(TestBed.inject(Router).url).toBe("/login");
        });

        it("should explain when the user can't view the app draft", async () => {
            consoleApi.getAppDraftDetailsResult = err({ kind: "permissionDenied" });

            await load();

            expect(anyPageState()).toEqual({
                kind: "error",
                error: {
                    kind: "permissionDenied",
                    resource: { kind: "appDraft", id: APP_DRAFT_ID },
                },
            });
        });

        it("should show an error when loading fails for any other reason", async () => {
            consoleApi.getAppDraftDetailsResult = err({ kind: "internal" });

            await load();

            expect(anyPageState()).toEqual({
                kind: "error",
                error: { kind: "unavailable", resource: { kind: "appDraft", id: APP_DRAFT_ID } },
            });
        });
    });

    describe("when saving a listing for the first time", () => {
        it("should create the listing text", async () => {
            await saveListing("Weather", "The weather");

            expect(consoleApi.createAppDraftListingTextRequests).toEqual([
                { appDraftId: APP_DRAFT_ID, name: "Weather", shortDescription: "The weather" },
            ]);
            expect(consoleApi.updateAppDraftListingTextRequests).toEqual([]);
        });

        it("should mark the listing as saved", async () => {
            await saveListing("Weather", "The weather");

            expect(pageState().listing).toMatchObject({
                name: "Weather",
                shortDescription: "The weather",
            });
            expect(pageState().saveListingState).toBe("idle");
        });

        it("should update with the created listing's etag when saving again", async () => {
            consoleApi.createAppDraftListingTextResult = ok({ etag: "created-etag" });
            await saveListing("Weather", "The weather");

            await saveListing("Weather 2", "The weather");

            expect(consoleApi.createAppDraftListingTextRequests).toHaveLength(1);
            expect(consoleApi.updateAppDraftListingTextRequests).toEqual([
                {
                    appDraftId: APP_DRAFT_ID,
                    etag: "created-etag",
                    name: "Weather 2",
                    shortDescription: "The weather",
                },
            ]);
        });

        it("should explain when the listing already exists", async () => {
            consoleApi.createAppDraftListingTextResult = err({ kind: "alreadyExists" });

            await saveListing("Weather", "The weather");

            expect(pageState().saveListingError).toEqual({ kind: "conflict", failedAttempts: 1 });
        });

        it("should explain instead of redirecting when unauthenticated", async () => {
            consoleApi.createAppDraftListingTextResult = err({ kind: "unauthenticated" });

            await saveListing("Weather", "The weather");

            expect(TestBed.inject(Router).url).toBe("/");
            expect(pageState().saveListingError).toEqual({
                kind: "unauthenticated",
                failedAttempts: 1,
            });
        });

        it("should keep the listing unsaved when saving fails", async () => {
            consoleApi.createAppDraftListingTextResult = err({ kind: "unknown" });

            await saveListing("Weather", "The weather");

            expect(pageState().listing).toBeUndefined();
            expect(nameInput().value).toBe("Weather");
        });
    });

    describe("when updating an existing listing", () => {
        beforeEach(async () => {
            TestBed.resetTestingModule();
            consoleApi = new FakeConsoleApi();
            consoleApi.getAppDraftDetailsResult = ok({ listingText: LISTING_TEXT });
            createContainer();
            await settle();
        });

        it("should update the listing text with the loaded etag", async () => {
            await saveListing("Weather 2", "Better weather");

            expect(consoleApi.updateAppDraftListingTextRequests).toEqual([
                {
                    appDraftId: APP_DRAFT_ID,
                    etag: "etag-1",
                    name: "Weather 2",
                    shortDescription: "Better weather",
                },
            ]);
            expect(consoleApi.createAppDraftListingTextRequests).toEqual([]);
        });

        it("should use the latest etag when updating again", async () => {
            consoleApi.updateAppDraftListingTextResult = ok({ etag: "etag-2" });
            await saveListing("Weather 2", "Better weather");

            await saveListing("Weather 3", "Better weather");

            expect(consoleApi.updateAppDraftListingTextRequests[1]?.etag).toBe("etag-2");
        });

        it("should make no requests when there are no changes to save", async () => {
            fixture.detectChanges();

            clickSave();
            await settle();

            expect(consoleApi.updateAppDraftListingTextRequests).toEqual([]);
            expect(consoleApi.createAppDraftListingTextRequests).toEqual([]);
        });

        it("should make no requests after a save when nothing has changed since", async () => {
            await saveListing("Weather 2", "Better weather");

            clickSave();
            await settle();

            expect(consoleApi.updateAppDraftListingTextRequests).toHaveLength(1);
        });

        it("should disable saving immediately", () => {
            consoleApi.updateAppDraftListingTextDelayMs = PROGRESS_DELAY_MS + 1;
            fixture.detectChanges();
            type(nameInput(), "Weather 2");

            clickSave();

            expect(pageState().saveListingState).toBe("pending");
        });

        it("should show progress once saving takes long enough", async () => {
            consoleApi.updateAppDraftListingTextDelayMs = PROGRESS_DELAY_MS + 1;
            fixture.detectChanges();
            type(nameInput(), "Weather 2");

            clickSave();
            await vi.advanceTimersByTimeAsync(PROGRESS_DELAY_MS);

            expect(pageState().saveListingState).toBe("loading");

            await settle();
            expect(pageState().saveListingState).toBe("idle");
        });

        it("should explain instead of redirecting when unauthenticated", async () => {
            consoleApi.updateAppDraftListingTextResult = err({ kind: "unauthenticated" });

            await saveListing("Weather 2", "Better weather");

            expect(TestBed.inject(Router).url).toBe("/");
            expect(pageState().saveListingError).toEqual({
                kind: "unauthenticated",
                failedAttempts: 1,
            });
            expect(nameInput().value).toBe("Weather 2");
        });

        it("should explain when the user can't edit the listing", async () => {
            consoleApi.updateAppDraftListingTextResult = err({ kind: "permissionDenied" });

            await saveListing("Weather 2", "Better weather");

            expect(pageState().saveListingError).toEqual({
                kind: "permissionDenied",
                failedAttempts: 1,
            });
        });

        it("should explain when the listing changed elsewhere", async () => {
            consoleApi.updateAppDraftListingTextResult = err({ kind: "etagMismatch" });

            await saveListing("Weather 2", "Better weather");

            expect(pageState().saveListingError).toEqual({ kind: "conflict", failedAttempts: 1 });
        });

        describe("when reloading the listing after a conflict", () => {
            const LATEST_LISTING_TEXT = {
                name: "Weather from elsewhere",
                shortDescription: "Changed elsewhere",
                etag: "etag-elsewhere",
            };

            beforeEach(async () => {
                consoleApi.updateAppDraftListingTextResult = err({ kind: "etagMismatch" });
                await saveListing("Weather 2", "Better weather");
                consoleApi.getAppDraftDetailsResult = ok({ listingText: LATEST_LISTING_TEXT });
            });

            it("should fetch the app draft's details again", async () => {
                clickReload();
                await settle();

                expect(consoleApi.getAppDraftDetailsRequests).toHaveLength(2);
            });

            it("should replace the user's edits with the latest listing", async () => {
                clickReload();
                await settle();
                fixture.detectChanges();

                expect(nameInput().value).toBe("Weather from elsewhere");
                expect(shortDescriptionInput().value).toBe("Changed elsewhere");
            });

            it("should hide the error once reloaded", async () => {
                clickReload();
                await settle();

                expect(pageState().saveListingError).toBeUndefined();
                expect(pageState().reloadListingState).toBe("idle");
            });

            it("should keep showing the page and error while reloading", async () => {
                consoleApi.getAppDraftDetailsDelayMs = PROGRESS_DELAY_MS + 1;

                clickReload();
                await vi.advanceTimersByTimeAsync(PROGRESS_DELAY_MS - 1);

                expect(pageState().saveListingError).toEqual({
                    kind: "conflict",
                    failedAttempts: 1,
                });
                expect(pageState().reloadListingState).toBe("pending");

                await vi.advanceTimersByTimeAsync(1);
                expect(pageState().reloadListingState).toBe("loading");

                await settle();
                expect(pageState().reloadListingState).toBe("idle");
            });

            it("should update with the latest etag when saving again", async () => {
                clickReload();
                await settle();
                consoleApi.updateAppDraftListingTextResult = ok({ etag: "etag-3" });

                await saveListing("Weather 3", "Better weather");

                expect(consoleApi.updateAppDraftListingTextRequests.at(-1)?.etag).toBe(
                    "etag-elsewhere",
                );
            });

            it("should show the full-page error when reloading fails", async () => {
                consoleApi.getAppDraftDetailsResult = err({ kind: "internal" });

                clickReload();
                await settle();

                expect(anyPageState()).toEqual({
                    kind: "error",
                    error: {
                        kind: "unavailable",
                        resource: { kind: "appDraft", id: APP_DRAFT_ID },
                    },
                });
            });
        });

        it("should keep a save error after a save fails following a reload", async () => {
            consoleApi.updateAppDraftListingTextResult = err({ kind: "etagMismatch" });
            await saveListing("Weather 2", "Better weather");
            consoleApi.getAppDraftDetailsResult = ok({ listingText: { ...LISTING_TEXT } });
            clickReload();
            await settle();

            await saveListing("Weather 3", "Better weather");

            expect(pageState().saveListingError).toEqual({ kind: "conflict", failedAttempts: 1 });
        });

        describe("when saving fails for any other reason", () => {
            beforeEach(async () => {
                consoleApi.updateAppDraftListingTextResult = err({ kind: "serviceUnavailable" });

                await saveListing("Weather 2", "Better weather");
            });

            it("should show an error", () => {
                expect(pageState().saveListingError).toEqual({
                    kind: "unavailable",
                    failedAttempts: 1,
                });
            });

            it("should enable saving again", () => {
                expect(pageState().saveListingState).toBe("idle");
            });

            it("should keep the user's edits", () => {
                fixture.detectChanges();

                expect(nameInput().value).toBe("Weather 2");
            });

            it("should count another failed attempt when saving again fails", async () => {
                clickSave();
                await settle();

                expect(pageState().saveListingError).toEqual({
                    kind: "unavailable",
                    failedAttempts: 2,
                });
            });

            it("should hide the error when dismissed", () => {
                fixture.detectChanges();
                fixture.nativeElement
                    .querySelector("acc-app-listing-text-editor button[aria-label=Dismiss]")
                    .click();

                expect(pageState().saveListingError).toBeUndefined();
            });

            it("should hide the error when saving again succeeds", async () => {
                consoleApi.updateAppDraftListingTextResult = ok({ etag: "etag-2" });

                clickSave();
                await settle();

                expect(pageState().saveListingError).toBeUndefined();
            });
        });
    });

    describe("when deleting the app draft", () => {
        beforeEach(async () => {
            await openDeleteDialog();
        });

        it("should delete the app draft", async () => {
            dialogButton("Delete").click();
            await settle();

            expect(consoleApi.deleteAppDraftRequests).toEqual([{ appDraftId: APP_DRAFT_ID }]);
        });

        it("should open the dashboard when deletion succeeds", async () => {
            dialogButton("Delete").click();
            await settle();

            expect(TestBed.inject(Router).url).toBe(`/orgs/${ORGANIZATION_ID}/dashboard`);
        });

        it("should explain when unauthenticated", async () => {
            consoleApi.deleteAppDraftResult = err({ kind: "unauthenticated" });

            dialogButton("Delete").click();
            await settle();

            expect(pageState().deleteAppDraftError).toEqual({
                kind: "unauthenticated",
                failedAttempts: 1,
            });
        });

        it("should open the login page when the error's log in link is clicked", async () => {
            consoleApi.deleteAppDraftResult = err({ kind: "unauthenticated" });
            dialogButton("Delete").click();
            await settle();
            fixture.detectChanges();

            document.querySelector<HTMLElement>("mat-dialog-container acc-error-alert a")!.click();
            await settle();

            expect(TestBed.inject(Router).url).toBe("/login");
        });

        it("should disable the delete button immediately", () => {
            consoleApi.deleteAppDraftDelayMs = PROGRESS_DELAY_MS + 1;

            dialogButton("Delete").click();

            expect(pageState().deleteAppDraftState).toBe("pending");
        });

        it("should show progress for the minimum duration once deletion takes long enough", async () => {
            consoleApi.deleteAppDraftResult = err({ kind: "unknown" });
            consoleApi.deleteAppDraftDelayMs = PROGRESS_DELAY_MS + 1;

            dialogButton("Delete").click();

            await vi.advanceTimersByTimeAsync(PROGRESS_DELAY_MS - 1);
            expect(pageState().deleteAppDraftState).toBe("pending");

            await vi.advanceTimersByTimeAsync(1);
            expect(pageState().deleteAppDraftState).toBe("loading");

            await vi.advanceTimersByTimeAsync(MIN_PROGRESS_MS - 1);
            expect(pageState().deleteAppDraftState).toBe("loading");

            await vi.advanceTimersByTimeAsync(1);
            expect(pageState().deleteAppDraftState).toBe("idle");
        });

        it("should explain when the user can't delete the app draft", async () => {
            consoleApi.deleteAppDraftResult = err({ kind: "permissionDenied" });

            dialogButton("Delete").click();
            await settle();

            expect(pageState().deleteAppDraftError).toEqual({
                kind: "permissionDenied",
                failedAttempts: 1,
            });
        });

        describe("when deletion fails for any other reason", () => {
            beforeEach(async () => {
                consoleApi.deleteAppDraftResult = err({ kind: "unknown" });

                dialogButton("Delete").click();
                await settle();
            });

            it("should show an error", () => {
                expect(pageState().deleteAppDraftError).toEqual({
                    kind: "unavailable",
                    failedAttempts: 1,
                });
            });

            it("should enable the delete button again", () => {
                expect(pageState().deleteAppDraftState).toBe("idle");
            });

            it("should hide the error when dismissed", () => {
                clickDismiss();

                expect(pageState().deleteAppDraftError).toBeUndefined();
            });

            it("should keep showing the error while deleting again", () => {
                consoleApi.deleteAppDraftDelayMs = PROGRESS_DELAY_MS + 1;

                dialogButton("Delete").click();

                expect(pageState().deleteAppDraftError).toEqual({
                    kind: "unavailable",
                    failedAttempts: 1,
                });
            });

            it("should count another failed attempt when deleting again fails", async () => {
                dialogButton("Delete").click();
                await settle();

                expect(pageState().deleteAppDraftError).toEqual({
                    kind: "unavailable",
                    failedAttempts: 2,
                });
            });

            it("should count failed attempts from one again after the error is dismissed", async () => {
                clickDismiss();

                dialogButton("Delete").click();
                await settle();

                expect(pageState().deleteAppDraftError).toEqual({
                    kind: "unavailable",
                    failedAttempts: 1,
                });
            });

            it("should hide the error when the dialog is closed", async () => {
                dialogButton("Cancel").click();
                await settle();

                expect(pageState().deleteAppDraftError).toBeUndefined();
            });

            it("should open the dashboard when deleting again succeeds", async () => {
                consoleApi.deleteAppDraftResult = ok(undefined);

                dialogButton("Delete").click();
                await settle();

                expect(TestBed.inject(Router).url).toBe(`/orgs/${ORGANIZATION_ID}/dashboard`);
            });
        });
    });
});

/**
 * {@link ConsoleApi} that records app draft operation attempts and returns preconfigured results
 * after preconfigured delays.
 */
class FakeConsoleApi implements ConsoleApi {
    getAppDraftDetailsRequests: GetAppDraftDetailsRequest[] = [];
    getAppDraftDetailsResult: Result<GetAppDraftDetailsResponse, GetAppDraftDetailsError> = ok({});
    getAppDraftDetailsDelayMs = 0;

    createAppDraftListingTextRequests: CreateAppDraftListingTextRequest[] = [];
    createAppDraftListingTextResult: Result<
        CreateAppDraftListingTextResponse,
        CreateAppDraftListingTextError
    > = ok({ etag: "etag-1" });

    updateAppDraftListingTextRequests: UpdateAppDraftListingTextRequest[] = [];
    updateAppDraftListingTextResult: Result<
        UpdateAppDraftListingTextResponse,
        UpdateAppDraftListingTextError
    > = ok({ etag: "etag-2" });
    updateAppDraftListingTextDelayMs = 0;

    deleteAppDraftRequests: DeleteAppDraftRequest[] = [];
    deleteAppDraftResult: Result<void, DeleteAppDraftError> = ok(undefined);
    deleteAppDraftDelayMs = 0;

    createAppDraft(): Promise<Result<CreateAppDraftResponse, CreateAppDraftError>> {
        throw new Error("not used by AppDraftEditorContainer");
    }

    async getAppDraftDetails(
        request: GetAppDraftDetailsRequest,
    ): Promise<Result<GetAppDraftDetailsResponse, GetAppDraftDetailsError>> {
        this.getAppDraftDetailsRequests.push(request);
        await new Promise((resolve) => setTimeout(resolve, this.getAppDraftDetailsDelayMs));
        return this.getAppDraftDetailsResult;
    }

    async createAppDraftListingText(
        request: CreateAppDraftListingTextRequest,
    ): Promise<Result<CreateAppDraftListingTextResponse, CreateAppDraftListingTextError>> {
        this.createAppDraftListingTextRequests.push(request);
        return this.createAppDraftListingTextResult;
    }

    async updateAppDraftListingText(
        request: UpdateAppDraftListingTextRequest,
    ): Promise<Result<UpdateAppDraftListingTextResponse, UpdateAppDraftListingTextError>> {
        this.updateAppDraftListingTextRequests.push(request);
        await new Promise((resolve) => setTimeout(resolve, this.updateAppDraftListingTextDelayMs));
        return this.updateAppDraftListingTextResult;
    }

    async deleteAppDraft(
        request: DeleteAppDraftRequest,
    ): Promise<Result<void, DeleteAppDraftError>> {
        this.deleteAppDraftRequests.push(request);
        await new Promise((resolve) => setTimeout(resolve, this.deleteAppDraftDelayMs));
        return this.deleteAppDraftResult;
    }

    getSelf(): Promise<Result<GetSelfResponse, GetSelfError>> {
        throw new Error("not used by AppDraftEditorContainer");
    }

    getOrganization(): Promise<Result<GetOrganizationResponse, GetOrganizationError>> {
        throw new Error("not used by AppDraftEditorContainer");
    }

    getMyOrganization(): Promise<Result<GetMyOrganizationResponse, GetMyOrganizationError>> {
        throw new Error("not used by AppDraftEditorContainer");
    }

    listAppDraftSummaries(): Promise<
        Result<ListAppDraftSummariesResponse, ListAppDraftSummariesError>
    > {
        throw new Error("not used by AppDraftEditorContainer");
    }
}
