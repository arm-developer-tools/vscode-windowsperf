/**
 * Copyright (C) 2024 Arm Limited
 */

import { ClearActiveResultFileSelection } from './clear-active-result-file-selection';
import { ObservableSelection } from '../observable-selection';
import { SampleFile } from '../views/sampling-results/tree-data-provider';
import { sampleFileFactory } from '../views/sampling-results/tree-data-provider.factories';

describe('ClearActiveResultFileSelection.execute', () => {
    it('clears selection', () => {
        const selection = new ObservableSelection<SampleFile>(sampleFileFactory());
        const command = new ClearActiveResultFileSelection(selection);

        command.execute();

        expect(selection.selected).toBeNull();
    });
});
