// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Component, input } from "@angular/core";

import {
    AppDraftEditorContent,
    type AppDraftEditorContentState,
    AppDraftEditorOutputs,
} from "../app-draft-editor-content/app-draft-editor-content";
import type {
    AppDraftResource,
    FullPageErrorPermissionDenied,
    FullPageErrorUnavailable,
} from "../full-page-error-view/full-page-error-view";
import { LoadablePage, type PageState } from "../loadable-page/loadable-page";

/**
 * The page for filling in a given app draft.
 */
@Component({
    imports: [AppDraftEditorContent, LoadablePage],
    selector: "acc-app-draft-editor-page",
    templateUrl: "./app-draft-editor-page.html",
})
export class AppDraftEditorPage extends AppDraftEditorOutputs {
    /**
     * The UI state of the app draft editor page.
     */
    readonly state = input.required<AppDraftEditorPageState>();
}

/**
 * The state of an {@link AppDraftEditorPage}.
 */
export type AppDraftEditorPageState = PageState<
    AppDraftEditorContentState,
    AppDraftEditorLoadError
>;

/**
 * An error which prevents an {@link AppDraftEditorPage} from loading.
 */
type AppDraftEditorLoadError =
    | FullPageErrorUnavailable<AppDraftResource>
    | FullPageErrorPermissionDenied<AppDraftResource>;
