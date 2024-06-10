/**
 * Copyright (C) 2024 Arm Limited
 */

import { logger } from '../logging/logger';

export class RunWperfRecord {
    constructor() {}

    execute = async () => {
        logger.info('Executing windowsperf.runWperfRecord');
    };
}
