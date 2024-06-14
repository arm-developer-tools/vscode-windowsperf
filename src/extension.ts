// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { ObservableCollection } from './observable-collection';
import { ObservableSelection } from './observable-selection';
import { OpenResultFile } from './commands/open-result-file';
import { CloseResultFile } from './commands/close-result-file';
import { SelectActiveResultFile } from './commands/select-active-result-file';
import { ClearActiveResultFileSelection } from './commands/clear-active-result-file-selection';
import { EditorHighlighter } from './views/sampling-results/editor-highlighter';
import { logger } from './logging/logger';
import { RunWperfRecord } from './commands/run-wperf-record';
import { TreeDataProvider } from './views/sampling-results/tree-data-provider';
import { SampleSource } from './views/sampling-results/sample-source';

export async function activate(context: vscode.ExtensionContext) {
    const sampleSources = new ObservableCollection<SampleSource>();
    const selectedSample = new ObservableSelection<SampleSource>();
    const editorHighligter = new EditorHighlighter(selectedSample);

    vscode.window.registerTreeDataProvider(
        'samplingResults',
        new TreeDataProvider(sampleSources, selectedSample),
    );

    const commands: Record<string, (...args: any) => any> = {
        'windowsperf.openResultFile': new OpenResultFile(sampleSources, selectedSample).execute,
        'windowsperf.closeResultFile': new CloseResultFile(sampleSources, selectedSample).execute,
        'windowsperf.selectActiveResultFile': new SelectActiveResultFile(
            sampleSources,
            selectedSample,
        ).execute,
        'windowsperf.clearActiveResultFileSelection': new ClearActiveResultFileSelection(
            selectedSample,
        ).execute,
        'windowsperf.record': new RunWperfRecord(sampleSources, selectedSample).execute,
    };

    Object.entries(commands).forEach(([name, command]) => {
        context.subscriptions.push(vscode.commands.registerCommand(name, command));
    });

    const disposables: vscode.Disposable[] = [editorHighligter];
    for (const toDispose of disposables) {
        context.subscriptions.push(toDispose);
    }
}

// This method is called when your extension is deactivated
export function deactivate() {
    logger.dispose();
}
