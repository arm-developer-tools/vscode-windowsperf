/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { logger } from '../logging/logger';
import { SampleSource } from '../views/sampling-results/sample-source';

export class CloseResultFile {
    constructor(
        private readonly collection: ObservableCollection<SampleSource>,
        private readonly selection: ObservableSelection<SampleSource>,
    ) {}

    execute = (sampleSource: vscode.TreeItem) => {
        logCommandExecution(sampleSource);

        this.collection.deleteFirst((sample) => sample.id === sampleSource.id);

        if (sampleSource.id === this.selection.selected?.id) {
            this.selection.selected = null;
        }
    };
}

const logCommandExecution = (sampleSource: vscode.TreeItem): void => {
    sampleSource.resourceUri
        ? logger.info('Executing windowsperf.closeResultFile', sampleSource.resourceUri?.toString())
        : logger.info('Executing windowsperf.closeResultFile', sampleSource.label);
};
