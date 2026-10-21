// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * A type which represents either success ({@link Ok}) or failure ({@link Err}).
 *
 * @typeParam T - the type of the success value.
 * @typeParam E - the type of the error.
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * A success value.
 *
 * @typeParam T - the type of the success value.
 */
export interface Ok<T> {
    readonly ok: true;

    /**
     * The success value.
     */
    readonly value: T;
}

/**
 * An error value.
 *
 * @typeParam E - the type of the error value.
 */
export interface Err<E> {
    readonly ok: false;

    /**
     * The error value.
     */
    readonly error: E;
}

/**
 * Creates a success result containing the given value.
 *
 * @typeParam T - the type of the success value.
 * @param value - the success value to wrap.
 * @returns an {@link Ok} containing `value`.
 */
export function ok<T>(value: T): Ok<T> {
    return { ok: true, value };
}

/**
 * Creates an error result containing the given error.
 *
 * @typeParam E - the type of the error value.
 * @param error - the error value to wrap.
 * @returns an {@link Err} containing `error`.
 */
export function err<E>(error: E): Err<E> {
    return { ok: false, error };
}
