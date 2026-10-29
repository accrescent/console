// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used by {@link} in TSDoc
import type { ConsoleApi } from "./console-api";

/**
 * An error returned by {@link ConsoleApi.createAppDraft}.
 */
export type CreateAppDraftError =
    | UnauthenticatedError
    | PermissionDeniedError
    | ResourceLimitExceededError
    | InternalError
    | ServiceUnavailableError
    | UnknownError;

/**
 * An error returned by {@link ConsoleApi.deleteAppDraft}.
 */
export type DeleteAppDraftError =
    | UnauthenticatedError
    | PermissionDeniedError
    | InternalError
    | ServiceUnavailableError
    | UnknownError;

/**
 * An error returned by {@link ConsoleApi.getSelf}.
 */
export type GetSelfError =
    | UnauthenticatedError
    | InternalError
    | ServiceUnavailableError
    | UnknownError;

/**
 * An error returned by {@link ConsoleApi.getMyOrganization}.
 */
export type GetMyOrganizationError =
    | UnauthenticatedError
    | InternalError
    | ServiceUnavailableError
    | UnknownError;

/**
 * An error returned by {@link ConsoleApi.getOrganization}.
 */
export type GetOrganizationError =
    | UnauthenticatedError
    | PermissionDeniedError
    | InternalError
    | ServiceUnavailableError
    | UnknownError;

/**
 * An error returned by {@link ConsoleApi.listAppDraftSummaries}.
 */
export type ListAppDraftSummariesError =
    | UnauthenticatedError
    | PermissionDeniedError
    | InternalError
    | ServiceUnavailableError
    | UnknownError;

/**
 * An error indicating the user isn't authenticated.
 */
export interface UnauthenticatedError {
    readonly kind: "unauthenticated";
}

/**
 * An error indicating the user doesn't have permission to perform the operation.
 */
export interface PermissionDeniedError {
    readonly kind: "permissionDenied";
}

/**
 * An error indicating the operation would exceed a resource limit.
 */
export interface ResourceLimitExceededError {
    readonly kind: "resourceLimitExceeded";
}

/**
 * An error indicating the service encountered an internal error.
 */
export interface InternalError {
    readonly kind: "internal";
}

/**
 * An error indicating the service is currently unavailable.
 */
export interface ServiceUnavailableError {
    readonly kind: "serviceUnavailable";
}

/**
 * An unknown error.
 */
export interface UnknownError {
    readonly kind: "unknown";
}
