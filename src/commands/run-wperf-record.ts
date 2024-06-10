/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { ProgressLocation } from 'vscode';
import { RecordOptions, runList, runRecord } from '../wperf/run';
import { logger } from '../logging/logger';
import { Sample } from '../wperf/parse';
import { RecordRun } from '../views/sampling-results/record-run';
import { ObservableCollection } from '../observable-collection';
import { logErrorAndNotify } from '../logging/error-logging';

export class RunWperfRecord {
    constructor(
        private readonly recordRuns: ObservableCollection<RecordRun>,
        private readonly getPmuEvents: typeof getPmuEventsFromWperf = getPmuEventsFromWperf,
        private readonly runWperfRecord: typeof runWperfRecordWithProgress = runWperfRecordWithProgress,
    ) {}

    execute = async () => {
        logger.info('Executing windowsperf.runWperfRecord');

        const pmuEvents = await this.getPmuEvents();

        if (!pmuEvents) {
            return;
        }

        // TODO: Prompt the user to select events, frequency and command
        const events = pmuEvents.filter(event => ['ld_spec', 'st_spec'].includes(event));
        const frequency = 100000;
        const command = 'cpython\\PCbuild\\arm64\\python_d.exe -c 10**10**10';
        const wperfOptions = { events, frequency, core: 1, command, timeoutSeconds: undefined };

        const sample = await this.runWperfRecord(wperfOptions);

        if (!sample) {
            return;
        }

        logger.debug(`Recording complete, recorded ${sample.sampling.events.length} events`);

        this.recordRuns.add(new RecordRun(command, sample));
    };
}

const getPmuEventsFromWperf = async (): Promise<string[] | undefined> => {
    try {
        return await runList();
    } catch (error: unknown) {
        logErrorAndNotify(error, 'Failed to get PMU events from wperf list.');
        return undefined;
    }
};

const runWperfRecordWithProgress = async (wperfOptions: RecordOptions): Promise<Sample | undefined> => {
    try {
        return vscode.window.withProgress(
            { title: 'Recording…', location: ProgressLocation.Notification, cancellable: true },
            (_progress, cancellationToken) => runRecord(wperfOptions, cancellationToken),
        );
    } catch (error: unknown) {
        logErrorAndNotify(error, 'Failed to run wperf record.');
        return undefined;
    }
};
