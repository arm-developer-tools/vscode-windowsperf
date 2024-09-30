/**
 * Copyright 2024 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
import {
    displayDisableVersionCheckNotification,
    hasCompatibleVersion,
} from './system-check/check-version-compatibility';

export const record = async (
    recordOptions: RecordOptions,
    recentEventsStore: Store<string[]>,
    analytics: Analytics,
    checkHasComaptibleVersion = hasCompatibleVersion,
    disableVersionCheckNotification = displayDisableVersionCheckNotification,
    runWperfRecord = runWperfRecordWithDriverLockHandling,
): Promise<SampleSource | undefined> => {
    const isCompatibleVersion = await checkHasComaptibleVersion();
    if (!isCompatibleVersion) {
        disableVersionCheckNotification();
        return;
    }

    recentEventsStore.value = updateRecentEvents(recentEventsStore.value, recordOptions);
    const { status, sample, errorMessage, driverLocked, forceLock } =
        await runWperfRecord(recordOptions);

    const eventsWithUnknownSymbol = sample ? getEventsWithUnknownSymbol(sample) : [];
    analytics.sendEvent('record', {
        ...getRecordTelemetryEventProperties(recordOptions),
        lockForced: String(forceLock),
        status,
        errorMessage,
        driverWasLocked: String(driverLocked),
        'events.unknownSymbol': JSON.stringify(eventsWithUnknownSymbol),
    });

    if (!sample) {
        return;
    }

    logger.debug(`Recording complete, recorded ${sample.events.length} events`);

    return SampleSource.fromRecordRun(new RecordRun(recordOptions, sample));
};

export const runWperfRecordWithDriverLockHandling = async (
    recordOptions: RecordOptions,
    runWperfRecord = runWperfRecordWithProgress,
    unlockMessage = offerUnlockMessage,
): Promise<{
    status: string;
    sample?: Sample;
    errorMessage: string;
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
): Promise<{ status: string; sample?: Sample; errorMessage: string; driverLocked?: boolean }> => {
    try {
        const sample = await vscode.window.withProgress(
            {
                title: 'Recording…',
                location: ProgressLocation.Notification,
                cancellable: true,
            },
            (_progress, cancellationToken) => runRecord(wperfOptions, forceLock, cancellationToken),
        );
        return { status: 'success', errorMessage: '', sample };
    } catch (error: unknown) {
        const { message: cliErrorMessage } = error as ExecException;
        const driverLocked = isWperfDriverLocked(cliErrorMessage);
        let errorMessage: string;
        if (driverLocked) {
            errorMessage = driverLockedFailureMessage;
        } else {
            errorMessage = cliErrorMessage;
            logErrorAndNotify(error, genericFailureMessage);
        }
        return { status: 'error', errorMessage, driverLocked };
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
