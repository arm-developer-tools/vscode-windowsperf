/**
 * Copyright (C) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';
import { ObservableCollection } from '../observable-collection';
import { RecordRun } from '../views/sampling-results/record-run';
import { sampleFactory } from '../wperf/parse.factories';
import { recordOptionsFactory } from '../wperf/run.factories';
import { RunWperfRecord, promptUserForRecordOptions, validateFrequencyInput } from './run-wperf-record';
import { RecordOptions } from '../wperf/run';

describe('RunWperfRecord', () => {
    it('does nothing if the user cancels the recording', async () => {
        const recordRuns = new ObservableCollection<RecordRun>();
        const cancellingPromptForRecordOptions = jest.fn().mockResolvedValue(undefined);
        const runWperfRecord = jest.fn();
        const command = new RunWperfRecord(recordRuns, cancellingPromptForRecordOptions, runWperfRecord, jest.fn());

        await command.execute();

        expect(runWperfRecord).not.toHaveBeenCalled();
        expect(recordRuns.items).toHaveLength(0);
    });

    it('runs wperf record with the record options returned by getRecordOptions', async () => {
        const recordOptions = recordOptionsFactory();
        const getRecordOptions = jest.fn().mockResolvedValue(recordOptions);
        const runWperfRecord = jest.fn().mockResolvedValue(undefined);
        const command = new RunWperfRecord(new ObservableCollection(), getRecordOptions, runWperfRecord, jest.fn());

        await command.execute();

        expect(runWperfRecord).toHaveBeenCalledWith(recordOptions);
    });

    it('does not add a RecordRun if the recording fails', async () => {
        const recordRuns = new ObservableCollection<RecordRun>();
        const getRecordOptions = jest.fn().mockResolvedValue(recordOptionsFactory());
        const failingRunWperfRecord = jest.fn().mockResolvedValue(undefined);
        const command = new RunWperfRecord(recordRuns, getRecordOptions, failingRunWperfRecord, jest.fn());

        await command.execute();

        expect(recordRuns.items).toHaveLength(0);
    });

    it('adds the recording to the recordRuns collection if the recording is successful', async () => {
        const recordRuns = new ObservableCollection<RecordRun>();
        const recordOptions = recordOptionsFactory();
        const getRecordOptions = jest.fn().mockResolvedValue(recordOptions);
        const sample = sampleFactory();
        const runWperfRecord = jest.fn().mockResolvedValue(sample);
        const command = new RunWperfRecord(recordRuns, getRecordOptions, runWperfRecord, jest.fn());

        await command.execute();

        expect(recordRuns.items).toHaveLength(1);
        expect(recordRuns.items[0]!.command).toBe(recordOptions.command);
        expect(recordRuns.items[0]!.parsedContent).toEqual(sample);
    });
});

describe('promptUserForRecordOptions', () => {
    it('returns undefined if the user cancels the event selection', async () => {
        const cancellingEventsPrompt = jest.fn().mockResolvedValue([]);
        const got = await promptUserForRecordOptions(cancellingEventsPrompt, jest.fn(), jest.fn());

        expect(got).toBeUndefined();
    });

    it('returns undefined if the user cancels the frequency input after entering an event', async () => {
        const promptForEvents = jest.fn().mockResolvedValue([faker.word.noun()]);
        const cancellingFrequencyPrompt = jest.fn().mockResolvedValue(undefined);
        const got = await promptUserForRecordOptions(promptForEvents, cancellingFrequencyPrompt, jest.fn());

        expect(got).toBeUndefined();
    });

    it('returns undefined if the user cancels the command input after entering an event and frequency', async () => {
        const promptForEvents = jest.fn().mockResolvedValue([faker.word.noun()]);
        const promptForFrequency = jest.fn().mockResolvedValue(faker.number.int());
        const cancellingPromptForCommand = jest.fn().mockResolvedValue(undefined);
        const got = await promptUserForRecordOptions(promptForEvents, promptForFrequency, cancellingPromptForCommand);

        expect(got).toBeUndefined();
    });

    it('returns a RecordOptions object with the selected events, frequency and command', async () => {
        const events = [faker.word.noun()];
        const promptForEvents = jest.fn().mockResolvedValue(events);
        const frequency = faker.number.int();
        const promptForFrequency = jest.fn().mockResolvedValue(frequency);
        const command = faker.lorem.sentence();
        const promptForCommand = jest.fn().mockResolvedValue(command);

        const got = await promptUserForRecordOptions(promptForEvents, promptForFrequency, promptForCommand);

        const want: RecordOptions = { events, frequency, core: 1, command, timeoutSeconds: undefined };
        expect(got).toEqual(want);
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
