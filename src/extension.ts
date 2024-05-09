// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { ObservableCollection } from './observable-collection';
import { SampleFile, TreeDataProvider } from './views/sampling-results/tree-data-provider';
import { fileDecorationProvider } from './views/sampling-results/file-decoration-provider';
import { OpenResultFile } from './commands/open-result-file';
import { CloseResultFile } from './commands/close-result-file';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    const sampleFiles = new ObservableCollection<SampleFile>();
    const treeProvider = new TreeDataProvider(sampleFiles);

    vscode.window.registerTreeDataProvider('samplingResults', treeProvider);
    vscode.window.registerFileDecorationProvider(fileDecorationProvider);

    const commands: Record<string, (...args: any) => any> = {
        'windowsperf.openResultFile': (new OpenResultFile(sampleFiles)).execute,
        'windowsperf.closeResultFile': (new CloseResultFile(sampleFiles)).execute,
    };
    for (const name in commands) {
        context.subscriptions.push(vscode.commands.registerCommand(name, commands[name]));
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
