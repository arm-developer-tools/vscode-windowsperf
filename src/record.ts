/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { logger } from './logging/logger';
import { ProgressLocation } from 'vscode';
import { RecordRun } from './views/sampling-results/record-run';
import { SampleSource } from './views/sampling-results/sample-source';
import { Sample, getEventsWithUnknownSymbol } from './wperf/parse/record';
import { runRecord } from './wperf/run';
import { logErrorAndNotify } from './logging/error-logging';
import { ObservableSelection } from './observable-selection';
import { ObservableCollection } from './observable-collection';
import { RecordOptions } from './wperf/record-options';
import { Store } from './store';
import { updateRecentEvents } from './recent-events';
import { Analytics } from '@arm-debug/vscode-telemetry';
import { getRecordTelemetryEventProperties } from './telemetry';

export const record = async (
    recordOptions: RecordOptions,
    recentEventsStore: Store<string[]>,
    analytics: Analytics,
    runWperfRecord: typeof runWperfRecordWithProgress = runWperfRecordWithProgress,
): Promise<SampleSource | undefined> => {
    recentEventsStore.value = updateRecentEvents(recentEventsStore.value, recordOptions);
    const { status, sample, message } = await runWperfRecord(recordOptions);

    const eventsWithUnknownSymbol = sample ? getEventsWithUnknownSymbol(sample) : [];
    analytics.sendEvent('record', {
        ...getRecordTelemetryEventProperties(recordOptions),
        status,
        message,
        'events.unknownSymbol': JSON.stringify(eventsWithUnknownSymbol),
    });

    if (!sample) {
        return;
    }

    logger.debug(`Recording complete, recorded ${sample.length} events`);

    return SampleSource.fromRecordRun(new RecordRun(recordOptions, sample));
};

const runWperfRecordWithProgress = async (
    wperfOptions: RecordOptions,
): Promise<{ status: string; sample?: Sample; message?: string }> => {
    try {
        const sample = await vscode.window.withProgress(
            {
                title: 'Recording…',
                location: ProgressLocation.Notification,
                cancellable: true,
            },
            (_progress, cancellationToken) => runRecord(wperfOptions, cancellationToken),
        );
        return { status: 'success', sample };
    } catch (error: unknown) {
        const message = 'Failed to run wperf record.';
        logErrorAndNotify(error, message);
        return { status: 'error', message };
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
