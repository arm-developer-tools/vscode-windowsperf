/**
 * Copyright (C) 2024 Arm Limited
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
