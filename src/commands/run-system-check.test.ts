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
import { RunSystemCheck } from './run-system-check';

import { generateSystemCheck } from '../system-check/system-check';

const mockGenerateSystemCheck = generateSystemCheck as jest.Mock;
jest.mock('../system-check/system-check', () => ({
    generateSystemCheck: jest.fn(),
}));

describe('RunSystemCheck', () => {
    it('runs system check and adds an initial log', async () => {
        const check = new RunSystemCheck();

        await check.execute();

        expect(logger.info).toHaveBeenCalledWith('Executing windowsperf.runSystemCheck');
        expect(mockGenerateSystemCheck).toHaveBeenCalled();
    });
});
