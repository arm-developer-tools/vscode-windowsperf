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

import { ClearActiveResultFileSelection } from './clear-active-result-file-selection';
import { ObservableSelection } from '../observable-selection';
import { sampleSourceFactory } from '../views/sampling-results/sample-source.factories';
import { SampleSource } from '../views/sampling-results/sample-source';

describe('ClearActiveResultFileSelection.execute', () => {
    it('clears selection', () => {
        const selection = new ObservableSelection<SampleSource>(sampleSourceFactory());
        const command = new ClearActiveResultFileSelection(selection);

        command.execute();

        expect(selection.selected).toBeNull();
    });
});
