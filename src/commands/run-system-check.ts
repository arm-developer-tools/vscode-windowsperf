/**
 * Copyright (C) 2024 Arm Limited
 */

import { logger } from '../logging/logger';
import { generateSystemCheck } from '../system-check/system-check';

export class RunSystemCheck {
    constructor() {}

    execute = async () => {
        logger.info('Executing windowsperf.runSystemCheck');
        await generateSystemCheck();
    };
}
