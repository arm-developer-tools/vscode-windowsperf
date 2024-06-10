/**
 * Copyright (C) 2024 Arm Limited
 */

import { RunWperfRecord } from './run-wperf-record';
import { logger } from '../logging/logger';

describe('RunWperfRecord', () => {
    it('logs execution', async () => {
        const command = new RunWperfRecord();

        await command.execute();

        expect(logger.info).toHaveBeenCalledWith('Executing windowsperf.runWperfRecord');
    });
});
