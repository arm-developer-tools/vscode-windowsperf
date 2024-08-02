/**
 * Copyright (C) 2024 Arm Limited
 */

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
import { RunWperfTest } from './commands/run-wperf-test';
import { RerunWperfRecord } from './commands/rerun-wperf-record';
import { ClearAllSampleResults } from './commands/clear-all-sample-results';
import { ShowSamplingSettings } from './commands/show-sampling-settings';
import { SamplingSettingsWebviewImpl } from './views/sampling-settings/main';
import { MessageHandlerImpl } from './views/sampling-settings/message-handler';
import { SamplingSettingsWebviewPanelImpl } from './views/sampling-settings/panel';
import { MementoStore } from './store';
import { defaultRecordOptions, recordOptionsShape } from './wperf/record-options';
import { recentEventsShape } from './recent-events';

export async function activate(context: vscode.ExtensionContext) {
    const recentEventsStore = new MementoStore(
        context.globalState,
        'recent-events',
        [],
        recentEventsShape,
    );

    const recordOptionsStore = new MementoStore(
        context.workspaceState,
        'record-options',
        defaultRecordOptions,
        recordOptionsShape,
    );

    const sampleSources = new ObservableCollection<SampleSource>();
    const selectedSample = new ObservableSelection<SampleSource>();
    const editorHighlighter = new EditorHighlighter(selectedSample);

    const samplingSettingsWebviewPanel = new SamplingSettingsWebviewPanelImpl(
        context,
        (distRoot, webview, validateOnCreate) =>
            new SamplingSettingsWebviewImpl(
                distRoot,
                webview,
                new MessageHandlerImpl(recordOptionsStore, validateOnCreate, recentEventsStore),
            ),
    );

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
        'windowsperf.record': new RunWperfRecord(
            sampleSources,
            selectedSample,
            recordOptionsStore,
            recentEventsStore,
            samplingSettingsWebviewPanel,
        ).execute,
        'windowsperf.test': new RunWperfTest().execute,
        'windowsperf.rerunRecord': new RerunWperfRecord(
            sampleSources,
            selectedSample,
            recentEventsStore,
        ).execute,
        'windowsperf.showSamplingSettings': new ShowSamplingSettings(samplingSettingsWebviewPanel)
            .execute,
        'windowsperf.clearAllSampleResults': new ClearAllSampleResults(
            sampleSources,
            selectedSample,
        ).execute,
    };

    Object.entries(commands).forEach(([name, command]) => {
        context.subscriptions.push(vscode.commands.registerCommand(name, command));
    });

    const disposables: vscode.Disposable[] = [editorHighlighter];
    for (const toDispose of disposables) {
        context.subscriptions.push(toDispose);
    }
}

// This method is called when your extension is deactivated
export function deactivate() {
    logger.dispose();
}
