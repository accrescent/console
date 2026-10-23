// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * The fraction of a quota at or above which it's considered nearly full.
 */
const NEARLY_FULL_FRACTION = 0.9;

/**
 * How much of a quota is used.
 *
 * - `available`: plenty of the quota remains.
 * - `nearlyFull`: little of the quota remains.
 * - `full`: none of the quota remains.
 */
export type QuotaLevel = "available" | "nearlyFull" | "full";

/**
 * Determines how much of a quota is used.
 *
 * @param count - the amount of the quota used.
 * @param limit - the maximum amount of the quota allowed to be used.
 * @returns the level the quota is filled to.
 */
export function quotaLevel(count: number, limit: number): QuotaLevel {
    if (count >= limit) {
        return "full";
    } else if (count >= limit * NEARLY_FULL_FRACTION || limit - count <= 1) {
        return "nearlyFull";
    } else {
        return "available";
    }
}
