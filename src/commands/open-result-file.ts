/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { ObservableCollection } from '../observable-collection';
import { SampleFile } from '../views/sampling-results/sample-file';

type VscodeWindow = Pick<typeof vscode.window, 'showOpenDialog' | 'showErrorMessage'>;

export class OpenResultFile {
    constructor(
        private readonly files: ObservableCollection<SampleFile>,
        private readonly vscodeWindow: VscodeWindow = vscode.window,
        private readonly sampleFileFromUri: typeof SampleFile.fromUri = SampleFile.fromUri,
    ) {}

    execute = async () => {
        const result = await this.vscodeWindow.showOpenDialog({
            canSelectMany: false,
            canSelectFolders: false,
        });
        if (result === undefined) { return; }
        const uri = result[0];
        try {
            const file = await this.sampleFileFromUri(uri);
            this.files.add(file);
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.vscodeWindow.showErrorMessage(error.message);
            }
            return;
        }
    };
}
