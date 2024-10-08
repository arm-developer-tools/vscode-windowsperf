/**
 * Copyright 2024 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';
import { activateTelemetry, Analytics } from '@arm-debug/vscode-telemetry';

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
import { RerunWperfRecord } from './commands/rerun-wperf-record';
import { ClearAllSampleResults } from './commands/clear-all-sample-results';
import { ShowSamplingSettings } from './commands/show-sampling-settings';
import { SamplingSettingsWebviewImpl } from './views/sampling-settings/main';
import { MessageHandlerImpl } from './views/sampling-settings/message-handler';
import { SamplingSettingsWebviewPanelImpl } from './views/sampling-settings/panel';
import { MementoStore } from './store';
import { getDefaultRecordOptions, recordOptionsShape } from './wperf/record-options';
import { recentEventsShape } from './recent-events';
import { ContextManager } from './context';
import { checkLlvmObjDumpOnPath } from './path';
import { RunSystemCheck } from './commands/run-system-check';

export const activate = activateTelemetry(
    async (context: vscode.ExtensionContext, analytics: Analytics) => {
        const recentEventsStore = new MementoStore(
            context.globalState,
            'recent-events',
            [],
            recentEventsShape,
        );

        const hasLlvmObjDumpPath = await checkLlvmObjDumpOnPath();
        const recordOptionsStore = new MementoStore(
            context.workspaceState,
            'record-options',
            getDefaultRecordOptions(hasLlvmObjDumpPath),
            recordOptionsShape,
        );

        const sampleSources = new ObservableCollection<SampleSource>();
        const selectedSample = new ObservableSelection<SampleSource>();
        const editorHighlighter = new EditorHighlighter(selectedSample);
        const contextManager = new ContextManager();
        const configurationChangeDisposable = vscode.workspace.onDidChangeConfiguration(
            contextManager.handleConfigurationChange,
        );

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
            'windowsperf.openResultFile': new OpenResultFile(
                sampleSources,
                selectedSample,
                analytics,
            ).execute,
            'windowsperf.systemCheck': new RunSystemCheck().execute,
            'windowsperf.closeResultFile': new CloseResultFile(sampleSources, selectedSample)
                .execute,
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
                analytics,
            ).execute,
            'windowsperf.rerunRecord': new RerunWperfRecord(
                sampleSources,
                selectedSample,
                recentEventsStore,
                analytics,
            ).execute,
            'windowsperf.showSamplingSettings': new ShowSamplingSettings(
                samplingSettingsWebviewPanel,
            ).execute,
            'windowsperf.clearAllSampleResults': new ClearAllSampleResults(
                sampleSources,
                selectedSample,
            ).execute,
        };

        Object.entries(commands).forEach(([name, command]) => {
            context.subscriptions.push(vscode.commands.registerCommand(name, command));
        });

        const disposables: vscode.Disposable[] = [editorHighlighter, configurationChangeDisposable];
        for (const toDispose of disposables) {
            context.subscriptions.push(toDispose);
        }
        analytics.sendEvent('cpuArchitecture', { architecture: process.arch });
    },
);

// This method is called when your extension is deactivated
export function deactivate() {
    logger.dispose();
}
