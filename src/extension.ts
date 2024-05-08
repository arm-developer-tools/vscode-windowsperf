// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { loadSampleFile } from './wperf/load';
import { ObservableCollection } from './observable-collection';
import { SampleFile, TreeDataProvider } from './views/sampling-results/tree-data-provider';
import { fileDecorationProvider } from './views/sampling-results/file-decoration-provider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    const sampleFiles = new ObservableCollection<SampleFile>();
    const treeProvider = new TreeDataProvider(sampleFiles);

    vscode.window.registerTreeDataProvider('samplingResults', treeProvider);
    vscode.window.registerFileDecorationProvider(fileDecorationProvider);
    context.subscriptions.push(vscode.commands.registerCommand(
        'windowsperf.openResultFile',
        async () => {
            const result = await vscode.window.showOpenDialog({
                canSelectMany: false,
                canSelectFolders: false,
            });
            if (result === undefined) { return; }
            const uri = result[0];
            try {
                const parsedContent = await loadSampleFile(uri.fsPath);
                sampleFiles.add({ parsedContent, uri });
            } catch (error: unknown) {
                if (error instanceof Error) {
                    vscode.window.showErrorMessage(error.message);
                }
            }
        }
    ));
    context.subscriptions.push(vscode.commands.registerCommand(
        'windowsperf.closeResultFile',
        (file: vscode.TreeItem) => sampleFiles.deleteFirst(item => item.uri === file.resourceUri)
    ));

}

// This method is called when your extension is deactivated
export function deactivate() {}
