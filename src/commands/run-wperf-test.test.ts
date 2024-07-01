/*
 * Copyright (c) 2024 Arm Limited
 */

import { logger } from '../logging/logger';
import { RunWperfTest } from './run-wperf-test';

describe('RunWperfTest', () => {
    describe('running the windowsperf test command', () => {
        it('call the wperfTest and logs the test results', async () => {
            const statusInfo = 'some config specs';
            const runWperfTest = jest.fn().mockResolvedValue(statusInfo);
            const wperfTest = new RunWperfTest(runWperfTest);

            await wperfTest.execute();

            const want = '\n' + statusInfo;

            expect(runWperfTest).toHaveReturned();
            expect(logger.info).toHaveBeenCalledTimes(2);
            expect(logger.info).toHaveBeenCalledWith(`Executing windowsperf.runWperfTest`);
            expect(logger.info).toHaveBeenCalledWith(want);
        });
    });
});
