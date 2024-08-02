/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { logger } from './logging/logger';
import { ProgressLocation } from 'vscode';
import { RecordRun } from './views/sampling-results/record-run';
import { SampleSource } from './views/sampling-results/sample-source';
import { Sample } from './wperf/parse/record';
import { runRecord } from './wperf/run';
import { logErrorAndNotify } from './logging/error-logging';
import { ObservableSelection } from './observable-selection';
import { ObservableCollection } from './observable-collection';
import { RecordOptions } from './wperf/record-options';
import { Store } from './store';
import { updateRecentEvents } from './recent-events';

export const record = async (
    recordOptions: RecordOptions,
    recentEventsStore: Store<string[]>,
    runWperfRecord: typeof runWperfRecordWithProgress = runWperfRecordWithProgress,
): Promise<SampleSource | undefined> => {
    recentEventsStore.value = updateRecentEvents(recentEventsStore.value, recordOptions);
    const sample = await runWperfRecord(recordOptions);

    if (!sample) {
        return;
    }

    logger.debug(`Recording complete, recorded ${sample.length} events`);

    return SampleSource.fromRecordRun(new RecordRun(recordOptions, sample));
};

const runWperfRecordWithProgress = async (
    wperfOptions: RecordOptions,
): Promise<Sample | undefined> => {
    try {
        return vscode.window.withProgress(
            {
                title: 'Recording…',
                location: ProgressLocation.Notification,
                cancellable: true,
            },
            (_progress, cancellationToken) => runRecord(wperfOptions, cancellationToken),
        );
    } catch (error: unknown) {
        logErrorAndNotify(error, 'Failed to run wperf record.');
        return undefined;
    }
};

export const prependSampleAndMakeSelected = (
    sample: SampleSource,
    source: ObservableCollection<SampleSource>,
    selectedFile: ObservableSelection<SampleSource>,
) => {
    selectedFile.selected = sample;
    source.prepend(sample);
};
