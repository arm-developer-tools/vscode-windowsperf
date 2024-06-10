/**
 * Copyright (C) 2024 Arm Limited
 */

import { ObservableCollection } from '../observable-collection';
import { RecordRun } from '../views/sampling-results/record-run';
import { sampleFactory } from '../wperf/parse.factories';
import { RunWperfRecord } from './run-wperf-record';

describe('RunWperfRecord', () => {
    it('lists PMU events and runs wperf record, updating the collection', async () => {
        const getPmuEvents = jest.fn();
        getPmuEvents.mockResolvedValue(['ld_spec', 'st_spec']);
        const runWperfRecord = jest.fn();
        const sample = sampleFactory();
        runWperfRecord.mockResolvedValue(sample);
        const recordRuns = new ObservableCollection<RecordRun>();
        const command = new RunWperfRecord(recordRuns, getPmuEvents, runWperfRecord);

        await command.execute();

        expect(getPmuEvents).toHaveBeenCalled();
        expect(runWperfRecord).toHaveBeenCalled();
        expect(recordRuns.items[0]?.parsedContent).toEqual(sample);
    });
});
