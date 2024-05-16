/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { SampleFile } from '../views/sampling-results/sample-file';

type VscodeWindow = Pick<typeof vscode.window, 'showOpenDialog' | 'showErrorMessage'>;

export class OpenResultFile {
    constructor(
        private readonly files: ObservableCollection<SampleFile>,
        private readonly selectedFile: ObservableSelection<SampleFile>,
        private readonly open: typeof openResultFile = openResultFile,
    ) {}

    execute = async () => {
        const file = await this.open();
        if (file !== undefined) {
            if (this.files.items.length === 0) {
                this.selectedFile.selected = file;
            }
            this.files.add(file);
        }
    };
}

export const openResultFile = async (
    vscodeWindow: VscodeWindow = vscode.window,
    sampleFileFromUri: typeof SampleFile.fromUri = SampleFile.fromUri,
): Promise<SampleFile | undefined> => {
    const result = await vscodeWindow.showOpenDialog({
        canSelectMany: false,
        canSelectFolders: false,
    });
    if (result === undefined || result[0] === undefined) {
        return;
    }
    const uri = result[0];
    try {
        return await sampleFileFromUri(uri);
    } catch (error: unknown) {
        if (error instanceof Error) {
            vscodeWindow.showErrorMessage(error.message);
        }
        return undefined;
    }
};
