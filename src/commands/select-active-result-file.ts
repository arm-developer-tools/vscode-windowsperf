/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { SampleFile } from '../views/sampling-results/sample-file';
import { logger } from '../logging/logger';

export class SelectActiveResultFile {
    constructor(
        private readonly collection: ObservableCollection<SampleFile>,
        private readonly selection: ObservableSelection<SampleFile>,
    ) {}

    execute = async (file: vscode.TreeItem) => {
        logger.info('Executing windowsperf.selectActiveResultFile', file.resourceUri?.toString());
        logger.debug('File tree item', file);
        for (const item of this.collection.items) {
            if (item.uri === file.resourceUri) {
                this.selection.selected = item;
                return;
            }
        }
    };
}
