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
