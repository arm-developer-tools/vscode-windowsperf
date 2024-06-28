/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { ObservableCollection } from '../observable-collection';
import { ProgressLocation, QuickPickItem } from 'vscode';
import { runList, runRecord } from '../wperf/run';
import { logger } from '../logging/logger';
import { RecordRun } from '../views/sampling-results/record-run';
import { logErrorAndNotify } from '../logging/error-logging';
import { SampleSource, isSourceRecordRun } from '../views/sampling-results/sample-source';
import { ObservableSelection } from '../observable-selection';
import { Sample } from '../wperf/parse/record';
import { PredefinedEvent } from '../wperf/parse/list';
import { RecordOptions } from '../wperf/record-options';

export class RunWperfRecord {
    constructor(
        private readonly sources: ObservableCollection<SampleSource>,
        private readonly selectedFile: ObservableSelection<SampleSource>,
        private readonly getRecordOptions: typeof promptUserForRecordOptions = promptUserForRecordOptions,
        private readonly runWperfRecord: typeof runWperfRecordWithProgress = runWperfRecordWithProgress,
        private readonly focusSamplingResults: typeof executeFocusSamplingResults = executeFocusSamplingResults,
    ) {}

    execute = async (sampleSource?: vscode.TreeItem) => {
        logger.info('Executing windowsperf.runWperfRecord');

        const previousCommand = getPreviousCommand(this.sources);
        const recordOptions = sampleSource
            ? this.extractRecordOptions(sampleSource)
            : await this.getRecordOptions(previousCommand);

        if (!recordOptions) {
            logger.debug('Recording cancelled');
            return;
        }

        const sample = await this.runWperfRecord(recordOptions);

        if (!sample) {
            return;
        }

        logger.debug(`Recording complete, recorded ${sample.length} events`);

        const newSampleSource = SampleSource.fromRecordRun(new RecordRun(recordOptions, sample));
        this.selectedFile.selected = newSampleSource;
        this.sources.prepend(newSampleSource);
        this.focusSamplingResults();
    };

    public extractRecordOptions(sampleSource: vscode.TreeItem) {
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

export const getPreviousCommand = (
    sources: ObservableCollection<SampleSource>,
): string | undefined => {
    const previousSourceRecordRun = sources.items
        .map(({ context }) => context)
        .find(isSourceRecordRun);

    return previousSourceRecordRun?.result.recordOptions.command;
};

export const validateFrequencyInput = (value: string): string | undefined => {
    const frequency = parseInt(value ?? '');
    return isNaN(frequency) ? 'Please enter a valid number' : undefined;
};

export const promptUserForRecordOptions = async (
    previousCommand: string | undefined,
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

    const command = await promptForCommand(previousCommand);

    if (command === undefined) {
        return;
    }

    return { events, frequency, core: 1, command, timeoutSeconds: undefined };
};

const executeFocusSamplingResults = () => {
    vscode.commands.executeCommand('samplingResults.focus');
};

export const getQuickPickItemsFromPredefinedEvents = (events: PredefinedEvent[]): QuickPickItem[] =>
    events
        .map(
            (event): QuickPickItem => ({
                label: event.Alias_Name,
                description: event.Description,
            }),
        )
        .sort((a, b) => a.label.localeCompare(b.label));

const getPmuEventsFromWperf = async (): Promise<QuickPickItem[]> => {
    return getQuickPickItemsFromPredefinedEvents(await runList());
};

const promptForEventsWithQuickPick = async (): Promise<string[]> => {
    let events: QuickPickItem[] | undefined;

    try {
        events = await vscode.window.showQuickPick(getPmuEventsFromWperf(), {
            canPickMany: true,
            title: 'Select events to record',
            ignoreFocusOut: true,
        });
    } catch (error: unknown) {
        logErrorAndNotify(error, 'Failed to get PMU events from wperf list.');
    }

    return events?.map(({ label }) => label) || [];
};

const promptForCommandWithQuickPick = async (
    initialValue: string | undefined,
): Promise<string | undefined> => {
    return vscode.window.showInputBox({
        title: 'Enter command to run',
        ignoreFocusOut: true,
        value: initialValue,
    });
};

const promptForFrequencyWithQuickPick = async (): Promise<number | undefined> => {
    const value = await vscode.window.showInputBox({
        title: 'Enter frequency',
        value: '100000',
        validateInput: validateFrequencyInput,
        ignoreFocusOut: true,
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
