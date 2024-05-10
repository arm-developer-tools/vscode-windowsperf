/**
 * Copyright (C) 2024 Arm Limited
 */

import { ObservableSelection } from '../observable-selection';
import { SampleFile } from '../views/sampling-results/tree-data-provider';

export class ClearActiveResultFileSelection {
    constructor(
        private readonly selection: ObservableSelection<SampleFile>,
    ) {}

    execute = async () => {
        this.selection.selected = null;
    };
}
