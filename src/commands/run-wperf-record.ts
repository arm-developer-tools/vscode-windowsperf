/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { ObservableCollection } from '../observable-collection';
import { QuickPickItem } from 'vscode';
import { runList } from '../wperf/run';
import { logger } from '../logging/logger';
import { logErrorAndNotify } from '../logging/error-logging';
import { SampleSource, isSourceRecordRun } from '../views/sampling-results/sample-source';
import { ObservableSelection } from '../observable-selection';
import { PredefinedEvent } from '../wperf/parse/list';
import { prependSampleAndMakeSelected, record } from '../record';
import { focusSamplingResults } from '../views/sampling-results/focus-sampling-results';
import { RecordOptions } from '../wperf/record-options';

export class RunWperfRecord {
    constructor(
        private readonly sources: ObservableCollection<SampleSource>,
        private readonly selectedFile: ObservableSelection<SampleSource>,
        private readonly getRecordOptions: typeof promptUserForRecordOptions = promptUserForRecordOptions,
        private readonly runRecord: typeof record = record,
        private readonly focusResults: typeof focusSamplingResults = focusSamplingResults,
    ) {}

    execute = async () => {
        logger.info('Executing windowsperf.runWperfRecord');

        const previousCommand = getPreviousCommand(this.sources);
        const recordOptions = await this.getRecordOptions(previousCommand);

        if (!recordOptions) {
            logger.debug('Recording cancelled');
            return;
        }
        const newSampleSource = await this.runRecord(recordOptions);
        if (newSampleSource) {
            prependSampleAndMakeSelected(newSampleSource, this.sources, this.selectedFile);
        }
        this.focusResults();
    };
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
