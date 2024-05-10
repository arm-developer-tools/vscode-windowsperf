/**
 * Copyright (C) 2024 Arm Limited
 */

import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { SampleFile } from '../views/sampling-results/sample-file';
import { sampleFileFactory } from '../views/sampling-results/sample-file.factories';
import { SelectActiveResultFile } from './select-active-result-file';

describe('SelectActiveResultsFile.execute', () => {
    it('picks matching file from collection and selects it', () => {
        const toSelect = sampleFileFactory();
        const collection = new ObservableCollection<SampleFile>([
            sampleFileFactory(), toSelect, sampleFileFactory()
        ]);
        const selection = new ObservableSelection<SampleFile>();
        const command = new SelectActiveResultFile(collection, selection);

        command.execute({ resourceUri: toSelect.uri });

        expect(selection.selected).toEqual(toSelect);
    });
});
