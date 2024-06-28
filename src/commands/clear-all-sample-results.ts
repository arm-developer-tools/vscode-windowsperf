/*
 * Copyright (c) 2024 Arm Limited
 */

import { logger } from '../logging/logger';
import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { SampleSource } from '../views/sampling-results/sample-source';

export class ClearAllSampleResults {
    constructor(
        private readonly source: ObservableCollection<SampleSource>,
        private readonly selection: ObservableSelection<SampleSource>,
    ) {}

    execute = async () => {
        logger.info('Executing windowsperf.clearAllSampleResults');
        this.source.deleteAll();
        this.selection.selected = null;
    };
}
