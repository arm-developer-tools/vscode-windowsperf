/*
 * Copyright (c) 2024 Arm Limited
 */

import { analyticsFactory } from '@arm-debug/vscode-telemetry/lib/analytics.factories';
import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { SampleSource } from '../views/sampling-results/sample-source';
import { sampleSourceRunFactory } from '../views/sampling-results/sample-source.factories';
import { RerunWperfRecord } from './rerun-wperf-record';

describe('RerunWperfRecord', () => {
    it('runs the recording from a tree item action and adds it to collection', async () => {
        const source1 = sampleSourceRunFactory();
        const source2 = sampleSourceRunFactory();

        const collection = new ObservableCollection<SampleSource>([source1]);
        const record = jest.fn().mockResolvedValueOnce(source2);
        const command = new RerunWperfRecord(
            collection,
            new ObservableSelection<SampleSource>(),
            { value: [] },
            analyticsFactory(),
            record,
            jest.fn(),
        );

        await command.execute({ id: source1.id });

        expect(collection.items).toHaveLength(2);
        expect(collection.items[1]!.context.result.displayName).toEqual(
            collection.items[0]!.context.result.displayName,
        );
        expect(collection.items[1]!.context.result.parsedContent).not.toEqual(
            collection.items[0]!.context.result.parsedContent,
        );
        expect(collection.items[1]!.id).not.toBe(collection.items[0]!.id);
    });

    it('does not add a RecordRun if the recording fails', async () => {
        const source = sampleSourceRunFactory();
        const collection = new ObservableCollection<SampleSource>([source]);
        const failingRecord = jest.fn().mockResolvedValue(undefined);
        const command = new RerunWperfRecord(
            collection,
            new ObservableSelection<SampleSource>(),
            { value: [] },
            analyticsFactory(),
            failingRecord,
            jest.fn(),
        );

        await command.execute({ id: source.id });

        expect(collection.items).toHaveLength(1);
    });
});
