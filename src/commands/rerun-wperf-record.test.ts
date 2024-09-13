/**
 * Copyright 2024 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
