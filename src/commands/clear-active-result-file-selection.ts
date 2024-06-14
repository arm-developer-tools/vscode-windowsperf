/**
 * Copyright (C) 2024 Arm Limited
 */

import { logger } from '../logging/logger';
import { ObservableSelection } from '../observable-selection';
import { SampleFile } from '../views/sampling-results/sample-file';

export class ClearActiveResultFileSelection {
    constructor(private readonly selection: ObservableSelection<SampleFile>) {}

    execute = async () => {
        logger.info('Executing windowsperf.clearActiveResultFileSelection');
        this.selection.selected = null;
    };
}
