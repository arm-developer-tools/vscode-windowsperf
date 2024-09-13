/**
 * Copyright 2024 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
