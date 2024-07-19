/**
 * Copyright (C) 2024 Arm Limited
 */

import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { SampleSource } from '../views/sampling-results/sample-source';
import { recordOptionsFactory } from '../wperf/record-options.factories';
import { RunWperfRecord } from './run-wperf-record';
import { sampleFactory } from '../wperf/parse/record.factories';
import { sampleSourceRunFactory } from '../views/sampling-results/sample-source.factories';
import { recordRunFactory } from '../views/sampling-results/record-run.factories';

describe('RunWperfRecord', () => {
    it('opens the Sampling Settings view if the configured record options are invalid', async () => {
        const invalidRecordOptions = recordOptionsFactory({ command: '' });
        const record = jest.fn().mockResolvedValue(undefined);
        const samplingSettingsWebviewPanel = { show: jest.fn() };
        const command = new RunWperfRecord(
            new ObservableCollection(),
            new ObservableSelection<SampleSource>(),
            { recordOptions: invalidRecordOptions },
            samplingSettingsWebviewPanel,
            record,
            jest.fn(),
        );

        await command.execute();

        expect(samplingSettingsWebviewPanel.show).toHaveBeenCalledWith();
        expect(record).not.toHaveBeenCalled();
    });

    it('runs wperf record with the record options configured if they are valid', async () => {
        const recordOptions = recordOptionsFactory();
        const record = jest.fn().mockResolvedValue(undefined);
        const command = new RunWperfRecord(
            new ObservableCollection(),
            new ObservableSelection<SampleSource>(),
            { recordOptions },
            { show: jest.fn() },
            record,
            jest.fn(),
        );

        await command.execute();

        expect(record).toHaveBeenCalledWith(recordOptions);
    });

    it('does not add a RecordRun if the recording fails', async () => {
        const collection = new ObservableCollection<SampleSource>();
        const failingRecord = jest.fn().mockResolvedValue(undefined);
        const command = new RunWperfRecord(
            collection,
            new ObservableSelection<SampleSource>(),
            { recordOptions: recordOptionsFactory() },
            { show: jest.fn() },
            failingRecord,
            jest.fn(),
        );

        await command.execute();

        expect(collection.items).toHaveLength(0);
    });

    it('adds the recording to the collection if the recording is successful', async () => {
        const collection = new ObservableCollection<SampleSource>();
        const recordOptions = recordOptionsFactory();
        const sample = sampleFactory();
        const sourceRun = sampleSourceRunFactory({
            result: recordRunFactory({ parsedContent: sample }),
        });
        const record = jest.fn().mockResolvedValue(sourceRun);
        const command = new RunWperfRecord(
            collection,
            new ObservableSelection<SampleSource>(),
            { recordOptions },
            { show: jest.fn() },
            record,
            jest.fn(),
        );

        await command.execute();

        expect(collection.items).toHaveLength(1);
        expect(collection.items[0]!.context.result.displayName).toBe(recordOptions.command);
        expect(collection.items[0]!.context.result.parsedContent).toEqual(sample);
    });

    it('selects the new sample', async () => {
        const collection = new ObservableCollection<SampleSource>();
        const selection = new ObservableSelection<SampleSource>();
        const recordOptions = recordOptionsFactory();
        const sample = sampleFactory();
        const sourceRun = sampleSourceRunFactory({
            result: recordRunFactory({ parsedContent: sample }),
        });
        const record = jest.fn().mockResolvedValue(sourceRun);
        const command = new RunWperfRecord(
            collection,
            selection,
            { recordOptions },
            { show: jest.fn() },
            record,
            jest.fn(),
        );

        await command.execute();

        const got = selection.selected?.context.result;

        expect(got?.parsedContent).toEqual(sample);
    });
});
