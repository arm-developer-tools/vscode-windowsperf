/**
 * Copyright (C) 2024 Arm Limited
 */

import { ObservableCollection } from '../observable-collection';
import { logger } from '../logging/logger';
import { SampleSource } from '../views/sampling-results/sample-source';
import { ObservableSelection } from '../observable-selection';
import { prependSampleAndMakeSelected, record } from '../record';
import { focusSamplingResults } from '../views/sampling-results/focus-sampling-results';
import { RecordOptionsStore } from '../record-options-store';
import { validateRecordOptions } from '../wperf/record-options';
import { SamplingSettingsWebviewPanel } from '../views/sampling-settings/panel';

export class RunWperfRecord {
    constructor(
        private readonly sources: ObservableCollection<SampleSource>,
        private readonly selectedFile: ObservableSelection<SampleSource>,
        private readonly recordOptionsStore: RecordOptionsStore,
        private readonly samplingSettingsWebviewPanel: SamplingSettingsWebviewPanel,
        private readonly runRecord: typeof record = record,
        private readonly focusResults: typeof focusSamplingResults = focusSamplingResults,
    ) {}

    execute = async () => {
        logger.info('Executing windowsperf.runWperfRecord');

        const validationResult = validateRecordOptions(this.recordOptionsStore.recordOptions);

        if (validationResult.missingFields.length > 0) {
            logger.debug('SamplingSettings invalid, not running wperf record');
            this.samplingSettingsWebviewPanel.show(true);
        } else {
            const newSampleSource = await this.runRecord(this.recordOptionsStore.recordOptions);
            if (newSampleSource) {
                prependSampleAndMakeSelected(newSampleSource, this.sources, this.selectedFile);
            }
            this.focusResults();
        }
    };
}
