// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { NgTemplateOutlet } from "@angular/common";
import {
    Component,
    Directive,
    inject,
    input,
    inputBinding,
    TemplateRef,
    ViewContainerRef,
} from "@angular/core";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

import {
    type FullPageError,
    FullPageErrorView,
} from "../full-page-error-view/full-page-error-view";
import { Page } from "../page/page";

/**
 * Renders content in the shared page layout, displaying loading and error states when appropriate.
 *
 * @example
 * ```html
 * <acc-content *accLoadablePage="state(); let loaded" [state]="loaded" />
 * ```
 *
 * @typeParam T - the type of the page's loaded value.
 */
@Directive({ selector: "[accLoadablePage]" })
export class LoadablePage<T> {
    /**
     * The state of the page.
     */
    readonly accLoadablePage = input.required<PageState<T, FullPageError>>();

    constructor() {
        const loadedTemplate = inject<TemplateRef<LoadablePageContext<T>>>(TemplateRef);
        inject(ViewContainerRef).createComponent(LoadablePageView, {
            bindings: [
                inputBinding("state", this.accLoadablePage),
                inputBinding("loadedTemplate", () => loadedTemplate),
            ],
        });
    }

    // Provide type checking. See
    // https://angular.dev/guide/directives/structural-directives#typing-the-directives-context.
    static ngTemplateContextGuard<T>(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by Angular
        _dir: LoadablePage<T>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by Angular
        _ctx: unknown,
    ): _ctx is LoadablePageContext<T> {
        return true;
    }
}

/**
 * The context of a {@link LoadablePage}'s template.
 */
interface LoadablePageContext<T> {
    /**
     * The page's loaded value.
     */
    readonly $implicit: T;
}

/**
 * The view a {@link LoadablePage} creates to render its page's state.
 */
@Component({
    imports: [FullPageErrorView, MatProgressSpinner, NgTemplateOutlet, Page],
    selector: "acc-loadable-page-view",
    templateUrl: "./loadable-page.html",
})
class LoadablePageView {
    /**
     * The state of the page.
     */
    readonly state = input.required<PageState<unknown, FullPageError>>();

    /**
     * The template to render once the page has loaded.
     */
    readonly loadedTemplate = input.required<TemplateRef<LoadablePageContext<unknown>>>();
}

/**
 * The state of a page.
 *
 * @typeParam T - the type of the page's loaded value.
 * @typeParam E - the errors which can prevent the page from loading.
 */
export type PageState<T, E extends FullPageError> =
    | PagePending
    | PageLoading
    | PageLoadFailed<E>
    | PageLoaded<T>;

/**
 * Loading the page is in progress but hasn't taken long enough to show progress.
 */
export interface PagePending {
    readonly kind: "pending";
}

/**
 * Loading the page is in progress and has taken long enough to show progress.
 */
export interface PageLoading {
    readonly kind: "loading";
}

/**
 * Loading the page failed.
 *
 * @typeParam E - the type of error which can prevent the page from loading.
 */
interface PageLoadFailed<E extends FullPageError> {
    readonly kind: "error";

    /**
     * The error that occurred.
     */
    readonly error: E;
}

/**
 * The page loaded successfully.
 *
 * @typeParam T - the type of the page's loaded value.
 */
interface PageLoaded<T> {
    readonly kind: "loaded";

    /**
     * The page's loaded value.
     */
    readonly value: T;
}
