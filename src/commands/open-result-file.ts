/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { SampleFile } from '../views/sampling-results/sample-file';
import { Uri } from 'vscode';
import { logger } from '../logging/logger';
import { logErrorAndNotify } from '../logging/error-logging';
import { SampleSource } from '../views/sampling-results/sample-source';

export class OpenResultFile {
    constructor(
        private readonly files: ObservableCollection<SampleSource>,
        private readonly selectedFile: ObservableSelection<SampleSource>,
        private readonly openFileOrPrompt: typeof openFileAtUriOrPrompt = openFileAtUriOrPrompt,
        private readonly focusOnSamplingResults: typeof executeResultsFocusCommand = executeResultsFocusCommand,
    ) {}

    readonly execute = async (inputUri: Uri | undefined) => {
        logger.info('Executing windowsperf.openResultFile');
        const file = await this.openFileOrPrompt(inputUri);
        if (file) {
            logger.info('Opened result file', file.uri.toString());
            const newSampleSource = SampleSource.fromSampleFile(file);
            this.selectedFile.selected = newSampleSource;
            this.files.prepend(newSampleSource);
            this.focusOnSamplingResults();
        }
    };
}

export const openFileAtUriOrPrompt = async (
    inputUri: Uri | undefined,
    promptUserToSelectFile: typeof promptUserToSelectResultFile = promptUserToSelectResultFile,
    loadFile: typeof SampleFile.fromUri = SampleFile.fromUri,
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

export const executeResultsFocusCommand = async () => {
    await vscode.commands.executeCommand('samplingResults.focus');
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
