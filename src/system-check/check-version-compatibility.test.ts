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

import { logger } from '../logging/logger';
import {
    disableVersionCompatibilityCheck,
    displayDisableVersionCheckNotification,
    hasCompatibleVersion,
} from './check-version-compatibility';
import { logErrorAndNotify, openLogButton } from '../logging/error-logging';

describe('hasCompatibleVersion', () => {
    it('returns true and shows found log if version matches', async () => {
        const foundVersion = '3.8.0';
        const res = await hasCompatibleVersion(
            jest.fn().mockResolvedValue(foundVersion),
            jest.fn().mockReturnValue(true),
        );

        expect(logger.info).toHaveBeenCalledWith(
            `Found: ${foundVersion} Required: 3.8.0 Compatible? true`,
        );
        expect(res).toEqual(true);
    });

    it('bypass version compatibility check if vscode setting is false', async () => {
        const res = await hasCompatibleVersion(jest.fn(), jest.fn().mockReturnValue(false));

        expect(res).toEqual(true);
    });

    it('show log error and notify notification when function is called', () => {
        displayDisableVersionCheckNotification();

        expect(logErrorAndNotify).toHaveBeenCalledWith(
            'Incompatible wperf.exe version.',
            'Incompatible wperf.exe version.',
            [
                openLogButton,
                {
                    name: 'Allow Incompatible Versions',
                    callback: disableVersionCompatibilityCheck,
                },
            ],
        );
    });
});
