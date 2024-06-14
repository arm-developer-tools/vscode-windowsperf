/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { logger } from '../logging/logger';
import { SampleSource } from '../views/sampling-results/sample-source';

export class SelectActiveResultFile {
    constructor(
        private readonly sources: ObservableCollection<SampleSource>,
        private readonly selection: ObservableSelection<SampleSource>,
    ) {}

    execute = async (sampleSource: vscode.TreeItem) => {
        logCommandExecution(sampleSource);
        for (const item of this.sources.items) {
            if (item.id === sampleSource.id) {
                this.selection.selected = item;
                return;
            }
        }
    };
}

const logCommandExecution = (sampleSource: vscode.TreeItem): void => {
    if (sampleSource.resourceUri) {
        logger.info(
            'Executing windowsperf.selectActiveResultFile',
            sampleSource.resourceUri?.toString(),
        );
        logger.debug('File tree item', sampleSource);
    } else {
        logger.info('Executing windowsperf.selectActiveResultFile', sampleSource.label);
        logger.debug('Record command tree item', sampleSource);
    }
};
