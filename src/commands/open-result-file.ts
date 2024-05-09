/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { ObservableCollection } from '../observable-collection';
import { SampleFile } from '../views/sampling-results/tree-data-provider';
import { loadSampleFile } from '../wperf/load';

type VscodeWindow = Pick< typeof vscode.window, 'showOpenDialog' | 'showErrorMessage'>;

export class OpenResultFile {
    constructor(
        private readonly files: ObservableCollection<SampleFile>,
        private readonly vscodeWindow: VscodeWindow = vscode.window
    ) {}

    execute = async () => {
        const result = await this.vscodeWindow.showOpenDialog({
            canSelectMany: false,
            canSelectFolders: false,
        });
        if (result === undefined) { return; }
        const uri = result[0];
        try {
            const parsedContent = await loadSampleFile(uri.fsPath);
            this.files.add({ parsedContent, uri });
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.vscodeWindow.showErrorMessage(error.message);
            }
        }
    };
}
