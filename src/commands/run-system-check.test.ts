/**
 * Copyright (C) 2024 Arm Limited
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
