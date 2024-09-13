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
import { sampleFileFactory } from '../views/sampling-results/sample-file.factories';
import { SelectActiveResultFile } from './select-active-result-file';
import { sampleSourceFactory } from '../views/sampling-results/sample-source.factories';

describe('SelectActiveResultsFile.execute', () => {
    it('picks matching id from collection and set as active selection', () => {
        const toSelect = sampleSourceFactory();
        const collection = new ObservableCollection<SampleSource>([
            SampleSource.fromSampleFile(sampleFileFactory()),
            toSelect,
            SampleSource.fromSampleFile(sampleFileFactory()),
        ]);
        const selection = new ObservableSelection<SampleSource>();
        const command = new SelectActiveResultFile(collection, selection);

        command.execute({ id: toSelect.id });

        expect(selection.selected).toEqual(toSelect);
    });
});
