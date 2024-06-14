/**
 * Copyright (C) 2024 Arm Limited
 */

import { logger } from '../logging/logger';
import { ObservableSelection } from '../observable-selection';
import { SampleSource } from '../views/sampling-results/sample-source';

export class ClearActiveResultFileSelection {
    constructor(private readonly selection: ObservableSelection<SampleSource>) {}

    execute = async () => {
        logger.info('Executing windowsperf.clearActiveResultFileSelection');
        this.selection.selected = null;
    };
}
