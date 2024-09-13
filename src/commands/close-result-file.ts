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
