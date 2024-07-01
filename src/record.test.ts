/*
 * Copyright (c) 2024 Arm Limited
 */

import { ObservableCollection } from './observable-collection';
import { ObservableSelection } from './observable-selection';
import { prependSampleAndMakeSelected, record } from './record';
import { recordRunFactory } from './views/sampling-results/record-run.factories';
import { SampleSource } from './views/sampling-results/sample-source';
import { sampleSourceFactory } from './views/sampling-results/sample-source.factories';
import { sampleFactory } from './wperf/parse/record.factories';
import { recordOptionsFactory } from './wperf/record-options.factories';

describe('record', () => {
    it('returns a RecordRun sample source', async () => {
        const recordOptions = recordOptionsFactory();
        const sample = sampleFactory();
        const runWperfRecord = jest.fn().mockResolvedValue(sample);

        const got = await record(recordOptions, runWperfRecord);

        const want = SampleSource.fromRecordRun(
            recordRunFactory({ recordOptions, parsedContent: sample }),
        );
        expect(got?.context).toEqual(want.context);
    });

    it('returns undefined if the recording fails', async () => {
        const recordOptions = recordOptionsFactory();
        const runWperfRecord = jest.fn().mockResolvedValue(undefined);

        const got = await record(recordOptions, runWperfRecord);

        expect(got).toBeUndefined();
    });
});

describe('prependSampleAndMakeSelected', () => {
    it('prepend the sample to the source', () => {
        const sample = sampleSourceFactory();
        const source = new ObservableCollection<SampleSource>();
        const selection = new ObservableSelection<SampleSource>();

        prependSampleAndMakeSelected(sample, source, selection);
        expect(source.items.length).toBe(1);
        expect(source.items[0]?.id).toBe(sample.id);
    });

    it('sets as the selection', () => {
        const sample = sampleSourceFactory();
        const source = new ObservableCollection<SampleSource>();
        const selection = new ObservableSelection<SampleSource>();

        prependSampleAndMakeSelected(sample, source, selection);
        expect(selection.selected).toEqual(sample);
    });
});
