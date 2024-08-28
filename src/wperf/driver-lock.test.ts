/*
 * Copyright (c) 2024 Arm Limited
 */

import { isWperfDriverLocked } from './driver-lock';

describe('isWperfDriverLocked', () => {
    it('recognises a driver lock error correctly', () => {
        const driverLockError = `warning: other WindowsPerf process acquired the wperf-driver.
        note: use --force-lock to force driver to give lock to current \`wperf\` process.
        Operation canceled!`;

        expect(isWperfDriverLocked(driverLockError)).toBeTruthy();
    });

    it('does not misinterpret a different error', () => {
        const wrongArgumentsError = `warning: unexpected arg '--return-as-xml' ignored
        no pid or process name specified, sample address are not de-ASLRed`;

        expect(isWperfDriverLocked(wrongArgumentsError)).toBeFalsy();
    });
});
