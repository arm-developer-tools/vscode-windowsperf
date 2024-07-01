/**
 * Copyright (C) 2024 Arm Limited
 */

// Set globals used by webpack in the bundle. This must be a separate module imported at the top of the entry
// module rather than inline in the entry module. This must be set before importing other modules, and imports are
// hoisted above other code.

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */

declare var __webpack_public_path__: string;
declare var __webpack_nonce__: string;

const anyWindow = window as any;

if (anyWindow.armPublicPath) {
    __webpack_public_path__ = anyWindow.armPublicPath;
}

if (anyWindow.armNonce) {
    __webpack_nonce__ = anyWindow.armNonce;
}
