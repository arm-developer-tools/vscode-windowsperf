/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { logger } from '../logging/logger';
import { ObservableSelection } from '../observable-selection';
import { SampleSource, isSourceRecordRun } from '../views/sampling-results/sample-source';
import { ObservableCollection } from '../observable-collection';
import { prependSampleAndMakeSelected, record } from '../record';
import { focusSamplingResults } from '../views/sampling-results/focus-sampling-results';

export class RerunWperfRecord {
    constructor(
        private readonly sources: ObservableCollection<SampleSource>,
        private readonly selectedFile: ObservableSelection<SampleSource>,
        private readonly runRecord: typeof record = record,
        private readonly focusResults: typeof focusSamplingResults = focusSamplingResults,
    ) {}

    execute = async (sampleSource: vscode.TreeItem) => {
        logger.info('Executing windowsperf.rerunWperfRecord');

        const recordOptions = this.extractRecordOptions(sampleSource);

        const newSampleSource = await this.runRecord(recordOptions);
        if (newSampleSource) {
            prependSampleAndMakeSelected(newSampleSource, this.sources, this.selectedFile);
        }
        this.focusResults();
    };

    private extractRecordOptions(sampleSource: vscode.TreeItem) {
        const source = this.sources.items.find((item) => item.id === `${sampleSource.id}`);
        if (!source) {
            throw new Error(
                `Recorded run matching tree item ${sampleSource.id} could not be found.`,
            );
        }
        if (isSourceRecordRun(source.context)) {
            return source.context.result.recordOptions;
        }
        throw new Error(`Tree item ${sampleSource.label} is not a wperf command option`);
    }
}
