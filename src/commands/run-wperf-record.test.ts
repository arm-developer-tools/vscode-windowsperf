/**
 * Copyright (C) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';
import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { SampleSource } from '../views/sampling-results/sample-source';
import { recordOptionsFactory } from '../wperf/run.factories';
import {
    RunWperfRecord,
    getPreviousCommand,
    getQuickPickItemsFromPredefinedEvents,
    promptUserForRecordOptions,
    validateFrequencyInput,
} from './run-wperf-record';
import { RecordOptions } from '../wperf/run';
import { sampleFactory } from '../wperf/parse/record.factories';
import { predefinedEventFactory } from '../wperf/parse/list.factories';
import {
    sampleSourceFileFactory,
    sampleSourceRunFactory,
} from '../views/sampling-results/sample-source.factories';
import { recordRunFactory } from '../views/sampling-results/record-run.factories';

describe('RunWperfRecord', () => {
    it('does nothing if the user cancels the recording', async () => {
        const collection = new ObservableCollection<SampleSource>();
        const cancellingPromptForRecordOptions = jest.fn().mockResolvedValue(undefined);
        const runWperfRecord = jest.fn();
        const command = new RunWperfRecord(
            collection,
            new ObservableSelection<SampleSource>(),
            cancellingPromptForRecordOptions,
            runWperfRecord,
            jest.fn(),
        );

        await command.execute();

        expect(runWperfRecord).not.toHaveBeenCalled();
        expect(collection.items).toHaveLength(0);
    });

    it('selects the loaded record command', async () => {
        const collection = new ObservableCollection<SampleSource>();
        const selection = new ObservableSelection<SampleSource>();
        const recordOptions = recordOptionsFactory();
        const getRecordOptions = jest.fn().mockResolvedValue(recordOptions);
        const sample = sampleFactory();
        const runWperfRecord = jest.fn().mockResolvedValue(sample);
        const command = new RunWperfRecord(
            collection,
            selection,
            getRecordOptions,
            runWperfRecord,
            jest.fn(),
        );

        await command.execute();

        const got = selection.selected?.context.result;

        expect(got?.parsedContent).toEqual(sample);
    });

    it('runs wperf record with the record options returned by getRecordOptions', async () => {
        const recordOptions = recordOptionsFactory();
        const getRecordOptions = jest.fn().mockResolvedValue(recordOptions);
        const runWperfRecord = jest.fn().mockResolvedValue(undefined);
        const command = new RunWperfRecord(
            new ObservableCollection(),
            new ObservableSelection<SampleSource>(),
            getRecordOptions,
            runWperfRecord,
            jest.fn(),
        );

        await command.execute();

        expect(runWperfRecord).toHaveBeenCalledWith(recordOptions);
    });

    it('does not add a RecordRun if the recording fails', async () => {
        const collection = new ObservableCollection<SampleSource>();
        const getRecordOptions = jest.fn().mockResolvedValue(recordOptionsFactory());
        const failingRunWperfRecord = jest.fn().mockResolvedValue(undefined);
        const command = new RunWperfRecord(
            collection,
            new ObservableSelection<SampleSource>(),
            getRecordOptions,
            failingRunWperfRecord,
            jest.fn(),
        );

        await command.execute();

        expect(collection.items).toHaveLength(0);
    });

    it('runs wperf record with the record options returned by getRecordOptions', async () => {
        const recordOptions = recordOptionsFactory();
        const getRecordOptions = jest.fn().mockResolvedValue(recordOptions);
        const runWperfRecord = jest.fn().mockResolvedValue(undefined);
        const command = new RunWperfRecord(
            new ObservableCollection(),
            new ObservableSelection<SampleSource>(),
            getRecordOptions,
            runWperfRecord,
            jest.fn(),
        );

        await command.execute();

        expect(runWperfRecord).toHaveBeenCalledWith(recordOptions);
    });

    it('does not add a RecordRun if the recording fails', async () => {
        const collection = new ObservableCollection<SampleSource>();
        const getRecordOptions = jest.fn().mockResolvedValue(recordOptionsFactory());
        const failingRunWperfRecord = jest.fn().mockResolvedValue(undefined);
        const command = new RunWperfRecord(
            collection,
            new ObservableSelection<SampleSource>(),
            getRecordOptions,
            failingRunWperfRecord,
            jest.fn(),
        );

        await command.execute();

        expect(collection.items).toHaveLength(0);
    });

    it('adds the recording to the collection if the recording is successful', async () => {
        const collection = new ObservableCollection<SampleSource>();
        const recordOptions = recordOptionsFactory();
        const getRecordOptions = jest.fn().mockResolvedValue(recordOptions);
        const sample = sampleFactory();
        const runWperfRecord = jest.fn().mockResolvedValue(sample);
        const command = new RunWperfRecord(
            collection,
            new ObservableSelection<SampleSource>(),
            getRecordOptions,
            runWperfRecord,
            jest.fn(),
        );

        await command.execute();

        expect(collection.items).toHaveLength(1);
        expect(collection.items[0]!.context.result.displayName).toBe(recordOptions.command);
        expect(collection.items[0]!.context.result.parsedContent).toEqual(sample);
    });

    it('runs the recording from a tree item action and add to collection', async () => {
        const recordRun = recordRunFactory();
        const source = sampleSourceRunFactory({ result: recordRun });

        const collection = new ObservableCollection<SampleSource>([source]);
        const getRecordOptions = jest.fn().mockResolvedValue(recordRun.recordOptions);
        const runWperfRecord = jest.fn().mockResolvedValue(sampleFactory());
        const command = new RunWperfRecord(
            collection,
            new ObservableSelection<SampleSource>(),
            getRecordOptions,
            runWperfRecord,
            jest.fn(),
        );

        await command.execute({ id: source.id });

        expect(collection.items).toHaveLength(2);
        expect(collection.items[1]!.context.result.displayName).toEqual(
            collection.items[0]!.context.result.displayName,
        );
        expect(collection.items[1]!.context.result.parsedContent).not.toEqual(
            collection.items[0]!.context.result.parsedContent,
        );
        expect(collection.items[1]!.id).not.toBe(collection.items[0]!.id);
    });
});

describe('promptUserForRecordOptions', () => {
    it('returns undefined if the user cancels the event selection', async () => {
        const cancellingEventsPrompt = jest.fn().mockResolvedValue([]);
        const got = await promptUserForRecordOptions(
            undefined,
            cancellingEventsPrompt,
            jest.fn(),
            jest.fn(),
        );

        expect(got).toBeUndefined();
    });

    it('returns undefined if the user cancels the frequency input after entering an event', async () => {
        const promptForEvents = jest.fn().mockResolvedValue([faker.word.noun()]);
        const cancellingFrequencyPrompt = jest.fn().mockResolvedValue(undefined);
        const got = await promptUserForRecordOptions(
            undefined,
            promptForEvents,
            cancellingFrequencyPrompt,
            jest.fn(),
        );

        expect(got).toBeUndefined();
    });

    it('returns undefined if the user cancels the command input after entering an event and frequency', async () => {
        const promptForEvents = jest.fn().mockResolvedValue([faker.word.noun()]);
        const promptForFrequency = jest.fn().mockResolvedValue(faker.number.int());
        const cancellingPromptForCommand = jest.fn().mockResolvedValue(undefined);
        const got = await promptUserForRecordOptions(
            undefined,
            promptForEvents,
            promptForFrequency,
            cancellingPromptForCommand,
        );

        expect(got).toBeUndefined();
    });

    it('returns a RecordOptions object with the selected events, frequency and command', async () => {
        const events = [faker.word.noun()];
        const promptForEvents = jest.fn().mockResolvedValue(events);
        const frequency = faker.number.int();
        const promptForFrequency = jest.fn().mockResolvedValue(frequency);
        const command = faker.lorem.sentence();
        const promptForCommand = jest.fn().mockResolvedValue(command);

        const got = await promptUserForRecordOptions(
            undefined,
            promptForEvents,
            promptForFrequency,
            promptForCommand,
        );

        const want: RecordOptions = {
            events,
            frequency,
            core: 1,
            command,
            timeoutSeconds: undefined,
        };
        expect(got).toEqual(want);
    });

    it('passes the previous command to promptForCommand if provided', async () => {
        const events = [faker.word.noun()];
        const promptForEvents = jest.fn().mockResolvedValue(events);
        const frequency = faker.number.int();
        const promptForFrequency = jest.fn().mockResolvedValue(frequency);
        const previousCommand = faker.lorem.sentence();
        const promptForCommand = jest.fn().mockResolvedValue(undefined);

        await promptUserForRecordOptions(
            previousCommand,
            promptForEvents,
            promptForFrequency,
            promptForCommand,
        );

        expect(promptForCommand).toHaveBeenCalledWith(previousCommand);
    });
});

describe('validateFrequencyInput', () => {
    it('returns an error message if the input is not a number', () => {
        const got = validateFrequencyInput('not a number');

        expect(got).not.toBeUndefined();
    });

    it('returns undefined if the input is a number', () => {
        const got = validateFrequencyInput('42');

        expect(got).toBeUndefined();
    });
});

describe('getQuickPickItemsFromPredefinedEvents', () => {
    it('returns a sorted array of QuickPickItems from an array of PredefinedEvents', () => {
        const event1 = predefinedEventFactory({ Alias_Name: 'Last' });
        const event2 = predefinedEventFactory({ Alias_Name: 'First' });
        const events = [event1, event2];

        const got = getQuickPickItemsFromPredefinedEvents(events);

        const want = [
            { label: 'First', description: event2.Description },
            { label: 'Last', description: event1.Description },
        ];
        expect(got).toEqual(want);
    });
});

describe('getPreviousCommand', () => {
    it('returns the command of the first SourceRecordRun in the collection', () => {
        const recordRun = recordRunFactory();
        const firstRecordRun = sampleSourceRunFactory({ result: recordRun });
        const secondRecordRun = sampleSourceRunFactory();

        const sources = new ObservableCollection<SampleSource>([
            sampleSourceFileFactory(),
            firstRecordRun,
            secondRecordRun,
        ]);

        const got = getPreviousCommand(sources);

        expect(got).toBe(recordRun.recordOptions.command);
    });

    it('returns undefined if there are no SourceRecordRuns in the collection', () => {
        const sources = new ObservableCollection<SampleSource>([sampleSourceFileFactory()]);

        const got = getPreviousCommand(sources);

        expect(got).toBeUndefined();
    });
});
