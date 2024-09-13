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
import { CloseResultFile } from './close-result-file';
import { sampleSourceFactory } from '../views/sampling-results/sample-source.factories';

describe('CloseResultFile.execute', () => {
    it('removes matching file from the file list', () => {
        const first = sampleSourceFactory();
        const willBeRemoved = sampleSourceFactory();
        const last = sampleSourceFactory();
        const files = new ObservableCollection<SampleSource>([first, willBeRemoved, last]);
        const command = new CloseResultFile(files, new ObservableSelection());

        command.execute({ id: willBeRemoved.id });

        const wantFiles = [first, last];
        expect(files.items).toEqual(wantFiles);
    });

    describe('clearing selection', () => {
        it('deselects file, if it is the one being closed', () => {
            const selected = sampleSourceFactory();
            const selection = new ObservableSelection(selected);
            const command = new CloseResultFile(new ObservableCollection(), selection);

            command.execute({ id: selected.id });

            expect(selection.selected).toBeNull();
        });

        it('keeps selection intact if other file is being closed', () => {
            const selected = sampleSourceFactory();
            const selection = new ObservableSelection(selected);
            const command = new CloseResultFile(new ObservableCollection(), selection);

            command.execute({ id: 'Some random id' });

            expect(selection.selected).not.toBeNull();
        });
    });
});
