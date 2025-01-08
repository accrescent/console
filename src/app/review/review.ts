// Copyright 2023-2025 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

export interface Review {
    result: ReviewResult;
    reasons?: string[];
    additional_notes?: string;
}

export enum ReviewResult {
    Approved = 'approved',
    Rejected = 'rejected',
}
