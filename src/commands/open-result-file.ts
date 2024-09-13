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
import { SampleFile } from '../views/sampling-results/sample-file';
import { Uri } from 'vscode';
import { logger } from '../logging/logger';
import { logErrorAndNotify } from '../logging/error-logging';
import { SampleSource } from '../views/sampling-results/sample-source';
import { focusSamplingResults } from '../views/sampling-results/focus-sampling-results';
import { Analytics } from '@arm-debug/vscode-telemetry';
import { Node as TreeDataNode } from '../views/sampling-results/tree-data-provider';

export class OpenResultFile {
    constructor(
        private readonly files: ObservableCollection<SampleSource>,
        private readonly selectedFile: ObservableSelection<SampleSource>,
        private readonly analytics: Analytics,
        private readonly openFileOrPrompt = openFileAtUriOrPrompt,
        private readonly focusResults = focusSamplingResults,
    ) {}

    readonly execute = async (inputUri: TreeDataNode | Uri | undefined) => {
        logger.info('Executing windowsperf.openResultFile');
        this.analytics.sendEvent('openingResultFile');

        inputUri = isUri(inputUri) ? inputUri : undefined;
        const file = await this.openFileOrPrompt(inputUri);
        if (file) {
            logger.info('Opened result file', file.uri.toString());
            const newSampleSource = SampleSource.fromSampleFile(file);
            this.selectedFile.selected = newSampleSource;
            this.files.prepend(newSampleSource);
            this.focusResults();
        }
    };
}

export const openFileAtUriOrPrompt = async (
    inputUri: Uri | undefined,
    promptUserToSelectFile = promptUserToSelectResultFile,
    loadFile = SampleFile.fromUri,
): Promise<SampleFile | undefined> => {
    const uri = inputUri || (await promptUserToSelectFile());
    if (uri) {
        try {
            return await loadFile(uri);
        } catch (error) {
            logErrorAndNotify(error, 'Failed to load result file.');
        }
    }
    return undefined;
};

export const promptUserToSelectResultFile = async (): Promise<vscode.Uri | undefined> => {
    const result = await vscode.window.showOpenDialog({
        canSelectMany: false,
        canSelectFolders: false,
        title: 'Select a WindowsPerf sampling JSON file',
        filters: {
            JSON: ['json'],
            All: ['*'],
        },
    });
    return result?.[0];
};

const isUri = (uri: unknown): uri is Uri => !!(uri && (uri as Partial<Uri>).fsPath);
