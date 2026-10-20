// SPDX-FileCopyrightText: © 2026 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

// Imported SVGs resolve to the URL of the emitted file per the `loader` option set in angular.json.
declare module "*.svg" {
    const url: string;
    export default url;
}
