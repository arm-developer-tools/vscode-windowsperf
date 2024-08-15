/**
 * Copyright (C) 2024 Arm Limited
 */

import { ObservableCollection } from '../observable-collection';
import { logger } from '../logging/logger';
import { SampleSource } from '../views/sampling-results/sample-source';
import { ObservableSelection } from '../observable-selection';
import { prependSampleAndMakeSelected, record } from '../record';
import { focusSamplingResults } from '../views/sampling-results/focus-sampling-results';
import { RecordOptions, validateRecordOptions } from '../wperf/record-options';
import { SamplingSettingsWebviewPanel } from '../views/sampling-settings/panel';
import { Store } from '../store';
import { Analytics } from '@arm-debug/vscode-telemetry';

export class RunWperfRecord {
    constructor(
        private readonly sources: ObservableCollection<SampleSource>,
        private readonly selectedFile: ObservableSelection<SampleSource>,
        private readonly recordOptionsStore: Store<RecordOptions>,
        private readonly recentEventsStore: Store<string[]>,
        private readonly samplingSettingsWebviewPanel: SamplingSettingsWebviewPanel,
        private readonly analytics: Analytics,
        private readonly runRecord: typeof record = record,
        private readonly focusResults: typeof focusSamplingResults = focusSamplingResults,
    ) {}

    execute = async () => {
        logger.info('Executing windowsperf.runWperfRecord');

        const validationResult = validateRecordOptions(this.recordOptionsStore.value);

        if (validationResult.missingFields.length > 0) {
            logger.debug('SamplingSettings invalid, not running wperf record');
            this.samplingSettingsWebviewPanel.show(true);
        } else {
            const recordOptions = this.recordOptionsStore.value;

            const newSampleSource = await this.runRecord(
                recordOptions,
                this.recentEventsStore,
                this.analytics,
            );
            if (newSampleSource) {
                prependSampleAndMakeSelected(newSampleSource, this.sources, this.selectedFile);
            }
            this.focusResults();
        }
    };
}
