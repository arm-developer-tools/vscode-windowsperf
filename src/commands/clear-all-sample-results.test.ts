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

import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { SampleSource } from '../views/sampling-results/sample-source';
import { sampleSourceFactory } from '../views/sampling-results/sample-source.factories';
import { ClearAllSampleResults } from './clear-all-sample-results';

describe('ClearAllSampleResults', () => {
    it('removes all items in the collection', () => {
        const collection = new ObservableCollection<SampleSource>([sampleSourceFactory()]);
        const command = new ClearAllSampleResults(
            collection,
            new ObservableSelection<SampleSource>(),
        );

        command.execute();

        expect(collection.items).toEqual([]);
    });

    it('clears selection', () => {
        const selection = new ObservableSelection<SampleSource>(sampleSourceFactory());
        const command = new ClearAllSampleResults(
            new ObservableCollection<SampleSource>(),
            selection,
        );

        command.execute();

        expect(selection.selected).toBeNull();
    });
});
