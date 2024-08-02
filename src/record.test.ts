/*
 * Copyright (c) 2024 Arm Limited
 */

import { ObservableCollection } from './observable-collection';
import { ObservableSelection } from './observable-selection';
import { updateRecentEvents } from './recent-events';
import { prependSampleAndMakeSelected, record } from './record';
import { recordRunFactory } from './views/sampling-results/record-run.factories';
import { SampleSource } from './views/sampling-results/sample-source';
import { sampleSourceFactory } from './views/sampling-results/sample-source.factories';
import { sampleFactory } from './wperf/parse/record.factories';
import { eventAndFrequencyFactory, recordOptionsFactory } from './wperf/record-options.factories';

describe('record', () => {
    it('returns a RecordRun sample source', async () => {
        const recordOptions = recordOptionsFactory();
        const sample = sampleFactory();
        const runWperfRecord = jest.fn().mockResolvedValue(sample);

        const got = await record(recordOptions, { value: [] }, runWperfRecord);

        const want = SampleSource.fromRecordRun(
            recordRunFactory({ recordOptions, parsedContent: sample }),
        );
        expect(got?.context).toEqual(want.context);
    });

    it('returns undefined if the recording fails', async () => {
        const recordOptions = recordOptionsFactory();
        const runWperfRecord = jest.fn().mockResolvedValue(undefined);

        const got = await record(recordOptions, { value: [] }, runWperfRecord);

        expect(got).toBeUndefined();
    });

    it('updates the recent events store', async () => {
        const recordOptions = recordOptionsFactory({
            events: [eventAndFrequencyFactory({ event: 'event1' })],
        });
        const runWperfRecord = jest.fn().mockResolvedValue(sampleSourceFactory());
        const recentEventsStore = { value: [] };

        await record(recordOptions, recentEventsStore, runWperfRecord);

        expect(recentEventsStore.value).toEqual(updateRecentEvents([], recordOptions));
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
