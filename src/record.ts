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
import { ExecException } from 'child_process';
import { isWperfDriverLocked } from './wperf/driver-lock';

export const record = async (
    recordOptions: RecordOptions,
    recentEventsStore: Store<string[]>,
    analytics: Analytics,
    runWperfRecord: typeof runWperfRecordWithDriverLockHandling = runWperfRecordWithDriverLockHandling,
): Promise<SampleSource | undefined> => {
    recentEventsStore.value = updateRecentEvents(recentEventsStore.value, recordOptions);
    const { status, sample, message, driverLocked, forceLock } =
        await runWperfRecord(recordOptions);

    const eventsWithUnknownSymbol = sample ? getEventsWithUnknownSymbol(sample) : [];
    analytics.sendEvent('record', {
        ...getRecordTelemetryEventProperties(recordOptions),
        lockForced: String(forceLock),
        status,
        message,
        driverWasLocked: String(driverLocked),
        'events.unknownSymbol': JSON.stringify(eventsWithUnknownSymbol),
    });

    if (!sample) {
        return;
    }

    logger.debug(`Recording complete, recorded ${sample.length} events`);

    return SampleSource.fromRecordRun(new RecordRun(recordOptions, sample));
};

export const runWperfRecordWithDriverLockHandling = async (
    recordOptions: RecordOptions,
    runWperfRecord: typeof runWperfRecordWithProgress = runWperfRecordWithProgress,
    unlockMessage: typeof offerUnlockMessage = offerUnlockMessage,
): Promise<{
    status: string;
    sample?: Sample;
    message?: string;
    driverLocked?: boolean;
    forceLock: boolean;
}> => {
    const result = await runWperfRecord(recordOptions, false);

    let forceLock = false;
    if (result.driverLocked) {
        const result = await unlockMessage();
        if (result === 'Yes') {
            forceLock = true;
            return { ...(await runWperfRecord(recordOptions, forceLock)), forceLock };
        }
    }

    return { ...result, forceLock };
};

const runWperfRecordWithProgress = async (
    wperfOptions: RecordOptions,
    forceLock: boolean,
): Promise<{ status: string; sample?: Sample; message?: string; driverLocked?: boolean }> => {
    try {
        const sample = await vscode.window.withProgress(
            {
                title: 'Recording…',
                location: ProgressLocation.Notification,
                cancellable: true,
            },
            (_progress, cancellationToken) => runRecord(wperfOptions, forceLock, cancellationToken),
        );
        return { status: 'success', sample };
    } catch (error: unknown) {
        const { message: cliErrorMessage } = error as ExecException;
        const driverLocked = isWperfDriverLocked(cliErrorMessage);

        let message: string;
        if (driverLocked) {
            message = driverLockedFailureMessage;
        } else {
            message = genericFailureMessage;
            logErrorAndNotify(error, genericFailureMessage);
        }
        return { status: 'error', message, driverLocked };
    }
};

const genericFailureMessage = 'Failed to run wperf record.';

export const driverLockedFailureMessage =
    'Failed to run wperf record. Wperf is currently being used by another process';

export const prependSampleAndMakeSelected = (
    sample: SampleSource,
    source: ObservableCollection<SampleSource>,
    selectedFile: ObservableSelection<SampleSource>,
) => {
    selectedFile.selected = sample;
    source.prepend(sample);
};

const offerUnlockMessage = () =>
    vscode.window.showWarningMessage(
        'WindowsPerf is currently being used by another process. Do you want to record anyway? This will cancel the other process.',
        'Yes',
        'No',
    );
