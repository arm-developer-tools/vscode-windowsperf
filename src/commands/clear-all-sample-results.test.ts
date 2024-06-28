/*
 * Copyright (c) 2024 Arm Limited
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
