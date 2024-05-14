// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { ObservableCollection } from './observable-collection';
import { ObservableSelection } from './observable-selection';
import { SampleFile } from './views/sampling-results/sample-file';
import { TreeDataProvider } from './views/sampling-results/tree-data-provider';
import { fileDecorationProvider } from './views/sampling-results/file-decoration-provider';
import { OpenResultFile } from './commands/open-result-file';
import { CloseResultFile } from './commands/close-result-file';
import { SelectActiveResultFile } from './commands/select-active-result-file';
import { ClearActiveResultFileSelection } from './commands/clear-active-result-file-selection';
import { EditorHighlighter } from './views/sampling-results/editor-highlighter';

export async function activate(context: vscode.ExtensionContext) {
    const sampleFiles = new ObservableCollection<SampleFile>();
    const selectedFile = new ObservableSelection<SampleFile>();

    new EditorHighlighter(selectedFile);

    vscode.window.registerTreeDataProvider(
        'samplingResults', new TreeDataProvider(sampleFiles, selectedFile),
    );
    vscode.window.registerFileDecorationProvider(fileDecorationProvider);

    const commands: Record<string, (...args: any) => any> = {
        'windowsperf.openResultFile': (
            new OpenResultFile(sampleFiles, selectedFile)
        ).execute,
        'windowsperf.closeResultFile': (
            new CloseResultFile(sampleFiles, selectedFile)
        ).execute,
        'windowsperf.selectActiveResultFile': (
            new SelectActiveResultFile(sampleFiles, selectedFile)
        ).execute,
        'windowsperf.clearActiveResultFileSelection': (
            new ClearActiveResultFileSelection(selectedFile)
        ).execute,
    };
    for (const name in commands) {
        context.subscriptions.push(vscode.commands.registerCommand(name, commands[name]));
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
