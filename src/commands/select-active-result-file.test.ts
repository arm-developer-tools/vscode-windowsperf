/**
 * Copyright (C) 2024 Arm Limited
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
