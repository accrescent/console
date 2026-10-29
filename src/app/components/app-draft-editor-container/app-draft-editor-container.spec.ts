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
import type { CreateAppDraftResponse } from "../../../domain/ports/console/create-app-draft-response";
import type { DeleteAppDraftRequest } from "../../../domain/ports/console/delete-app-draft-request";
import type {
    CreateAppDraftError,
    DeleteAppDraftError,
    GetMyOrganizationError,
    GetOrganizationError,
    GetSelfError,
    ListAppDraftSummariesError,
} from "../../../domain/ports/console/errors";
import type { GetMyOrganizationResponse } from "../../../domain/ports/console/get-my-organization-response";
import type { GetOrganizationResponse } from "../../../domain/ports/console/get-organization-response";
import type { GetSelfResponse } from "../../../domain/ports/console/get-self-response";
import type { ListAppDraftSummariesResponse } from "../../../domain/ports/console/list-app-draft-summaries-response";
import { CONSOLE_API } from "../../tokens";
import {
    AppDraftEditorPage,
    type AppDraftEditorPageState,
} from "../app-draft-editor-page/app-draft-editor-page";
import { AppDraftEditorContainer } from "./app-draft-editor-container";

const ORGANIZATION_ID = "org-123";
const APP_DRAFT_ID = "draft-123";

describe("AppDraftEditorContainer", () => {
    let consoleApi: FakeConsoleApi;
    let fixture: ComponentFixture<AppDraftEditorContainer>;

    beforeEach(async () => {
        consoleApi = new FakeConsoleApi();
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
        await settle();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    async function settle(): Promise<void> {
        await vi.runAllTimersAsync();
        await fixture.whenStable();
    }

    function pageState(): AppDraftEditorPageState {
        fixture.detectChanges();
        return fixture.debugElement
            .query(By.directive(AppDraftEditorPage))
            .injector.get(AppDraftEditorPage)
            .state();
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

    it("should be idle initially", () => {
        expect(pageState()).toEqual({ deleteAppDraftState: "idle" });
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

        it("should redirect to the login page when unauthenticated", async () => {
            consoleApi.deleteAppDraftResult = err({ kind: "unauthenticated" });

            dialogButton("Delete").click();
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
 * {@link ConsoleApi} that records app draft deletion attempts and returns a preconfigured result
 * after a preconfigured delay.
 */
class FakeConsoleApi implements ConsoleApi {
    deleteAppDraftRequests: DeleteAppDraftRequest[] = [];
    deleteAppDraftResult: Result<void, DeleteAppDraftError> = ok(undefined);
    deleteAppDraftDelayMs = 0;

    createAppDraft(): Promise<Result<CreateAppDraftResponse, CreateAppDraftError>> {
        throw new Error("not used by AppDraftEditorContainer");
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
