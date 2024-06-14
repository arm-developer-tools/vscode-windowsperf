/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { ObservableCollection } from '../observable-collection';
import { ProgressLocation } from 'vscode';
import { RecordOptions, runList, runRecord } from '../wperf/run';
import { Sample } from '../wperf/parse';
import { logger } from '../logging/logger';
import { RecordRun } from '../views/sampling-results/record-run';
import { logErrorAndNotify } from '../logging/error-logging';

export class RunWperfRecord {
    constructor(
        private readonly recordRuns: ObservableCollection<RecordRun>,
        private readonly getRecordOptions: typeof promptUserForRecordOptions = promptUserForRecordOptions,
        private readonly runWperfRecord: typeof runWperfRecordWithProgress = runWperfRecordWithProgress,
        private readonly focusSamplingResults: typeof executeFocusSamplingResults = executeFocusSamplingResults,
    ) {}

    execute = async () => {
        logger.info('Executing windowsperf.runWperfRecord');

        const recordOptions = await this.getRecordOptions();
        if (!recordOptions) {
            logger.debug('Recording cancelled');
            return;
        }

        const sample = await this.runWperfRecord(recordOptions);

        if (!sample) {
            return;
        }

        logger.debug(`Recording complete, recorded ${sample.sampling.events.length} events`);

        this.recordRuns.add(new RecordRun(recordOptions.command, sample));
        this.focusSamplingResults();
    };
}

export const validateFrequencyInput = (value: string): string | undefined => {
    const frequency = parseInt(value ?? '');
    return isNaN(frequency) ? 'Please enter a valid number' : undefined;
};

export const promptUserForRecordOptions = async (
    promptForEvents: typeof promptForEventsWithQuickPick = promptForEventsWithQuickPick,
    promptForFrequency: typeof promptForFrequencyWithQuickPick = promptForFrequencyWithQuickPick,
    promptForCommand: typeof promptForCommandWithQuickPick = promptForCommandWithQuickPick,
): Promise<RecordOptions | undefined> => {
    const events = await promptForEvents();

    if (events.length === 0) {
        return;
    }

    const frequency = await promptForFrequency();

    if (frequency === undefined) {
        return;
    }

    const command = await promptForCommand();

    if (command === undefined) {
        return;
    }

    return { events, frequency, core: 1, command, timeoutSeconds: undefined };
};

const executeFocusSamplingResults = () => {
    vscode.commands.executeCommand('samplingResults.focus');
};

const getPmuEventsFromWperf = async (): Promise<string[]> => {
    return (await runList()).sort();
};

const promptForEventsWithQuickPick = async (): Promise<string[]> => {
    let events: string[] | undefined;

    try {
        events = await vscode.window.showQuickPick(getPmuEventsFromWperf(), {
            canPickMany: true,
            title: 'Select events to record',
        });
    } catch (error: unknown) {
        logErrorAndNotify(error, 'Failed to get PMU events from wperf list.');
    }

    return events || [];
};

const promptForCommandWithQuickPick = async (): Promise<string | undefined> => {
    return vscode.window.showInputBox({ title: 'Enter command to run' });
};

const promptForFrequencyWithQuickPick = async (): Promise<number | undefined> => {
    const value = await vscode.window.showInputBox({
        title: 'Enter frequency',
        value: '100000',
        validateInput: validateFrequencyInput,
    });
    const frequency = parseInt(value ?? '');
    return isNaN(frequency) ? undefined : frequency;
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
