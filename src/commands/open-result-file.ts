/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { SampleFile } from '../views/sampling-results/sample-file';
import { Uri } from 'vscode';
import { logger } from '../logging/logger';

export class OpenResultFile {
    constructor(
        private readonly files: ObservableCollection<SampleFile>,
        private readonly selectedFile: ObservableSelection<SampleFile>,
        private readonly openFileOrPrompt: typeof openFileAtUriOrPrompt = openFileAtUriOrPrompt,
    ) {}

    readonly execute = async (inputUri: Uri | undefined) => {
        logger.info('Executing windowsperf.openResultFile');
        const file = await this.openFileOrPrompt(inputUri);
        if (file) {
            logger.info('Opened result file', file.uri.toString());
            if (this.files.items.length === 0) {
                this.selectedFile.selected = file;
            }
            this.files.add(file);
        }
    };
}

export const openFileAtUriOrPrompt = async (
    inputUri: Uri | undefined,
    promptUserToSelectFile: typeof promptUserToSelectResultFile = promptUserToSelectResultFile,
    loadFile: typeof loadResultFile = loadResultFile,
): Promise<SampleFile | undefined > => {
    const uri = inputUri || await promptUserToSelectFile();
    return uri && await loadFile(uri);
};

export const loadResultFile = async (uri: Uri): Promise<SampleFile | undefined> => {
    try {
        return await SampleFile.fromUri(uri);
    } catch (error: unknown) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(error.message);
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
