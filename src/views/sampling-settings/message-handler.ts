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

import { Uri, WorkspaceFolder } from 'vscode';
import * as vscode from 'vscode';
import { logger } from '../../logging/logger';
import { Core, getCpuInfo } from '../../wperf/cores';
import { RecordOptions } from '../../wperf/record-options';
import { runList, runTestAndParse } from '../../wperf/run';
import {
    ErrorDetail,
    ErrorResult,
    EventsAndTestLoadResult,
    ToView,
    fromViewShape,
} from './messages';
import * as path from 'path';
import { Store } from '../../store';
import { checkWperfExistsInSettingsOrPath } from '../../path';
import { checkLlvmObjDumpOnPath } from '../../path';
import { generateSystemCheck } from '../../system-check/system-check';

export type MessageHandler = {
    handleMessage: (message: unknown) => Promise<ToView | undefined>;
};

export class MessageHandlerImpl implements MessageHandler {
    private eventsAndTestLoadResultPromise: Promise<EventsAndTestLoadResult>;

    constructor(
        private readonly recordOptionsStore: Store<RecordOptions>,
        private readonly validateOnCreate: boolean,
        private readonly recentEventsStore: Store<string[]>,
        private readonly getPredefinedEvents = runList,
        private readonly getTestResults = runTestAndParse,
        private readonly promptForCommand = promptUserForCommand,
        private readonly checkWperfExists = checkWperfExistsInSettingsOrPath,
    ) {
        // Start loading while the webview content loads, to improve start up time
        this.eventsAndTestLoadResultPromise = this.loadEventsAndTestResults();
    }

    public readonly handleMessage = async (message: unknown): Promise<ToView | undefined> => {
        const parseResult = fromViewShape.safeParse(message);

        if (parseResult.success) {
            const fromViewMessage = parseResult.data;
            logger.debug('Message from SamplingSettings view', fromViewMessage);

            switch (fromViewMessage.type) {
                case 'ready':
                    return this.handleReady();
                case 'recordOptions':
                    return this.handleRecordOptions(fromViewMessage.recordOptions);
                case 'openCommandFilePicker':
                    return this.handleOpenCommandFilePicker();
                case 'record':
                    return this.handleRecordCommand();
                case 'showOutputChannel':
                    return this.showOutputChannel();
                case 'runSystemCheck':
                    return this.handleRunSystemCheckCommand();
                case 'retry':
                    return this.handleRetry();
            }
        } else {
            logger.error('Received invalid message from webview', parseResult.error, message);
        }

        return undefined;
    };

    private readonly handleOpenCommandFilePicker = async (): Promise<ToView | undefined> => {
        const currentCommand = this.recordOptionsStore.value.command;
        const defaultUri = path.isAbsolute(currentCommand)
            ? Uri.file(path.dirname(currentCommand))
            : undefined;

        const command = await this.promptForCommand(defaultUri);

        if (command) {
            this.recordOptionsStore.value = {
                ...this.recordOptionsStore.value,
                command,
            };

            return { type: 'selectedCommand', command };
        }

        return undefined;
    };

    public readonly showOutputChannel = async (): Promise<undefined> => {
        logger.show();
    };

    public readonly handleRecordCommand = async () => {
        await vscode.commands.executeCommand('windowsperf.record');
        return undefined;
    };

    public readonly handleRunSystemCheckCommand = async () => {
        await generateSystemCheck();
        return undefined;
    };

    private async createInitialDataMessage(
        eventsAndTestLoadResult: Promise<EventsAndTestLoadResult>,
    ): Promise<ToView> {
        return {
            type: 'initialData',
            recordOptions: this.recordOptionsStore.value,
            recentEvents: this.recentEventsStore.value,
            cores: this.listCores(),
            eventsAndTestLoadResult: await eventsAndTestLoadResult,
            validate: this.validateOnCreate,
            hasLlvmObjDumpPath: await this.getHasLlvmObjDumpPath(),
        };
    }

    public readonly handleReady = async () => {
        return this.createInitialDataMessage(this.eventsAndTestLoadResultPromise);
    };

    public readonly handleRetry = async () => {
        const eventsAndTestResultPromise = this.loadEventsAndTestResults();
        this.eventsAndTestLoadResultPromise = eventsAndTestResultPromise;
        return this.createInitialDataMessage(eventsAndTestResultPromise);
    };

    public readonly handleRecordOptions = async (
        recordOptions: RecordOptions,
    ): Promise<undefined> => {
        this.recordOptionsStore.value = recordOptions;
        return undefined;
    };

    private readonly listCores = (): Core[] => {
        return getCpuInfo();
    };

    private readonly getHasLlvmObjDumpPath = async (): Promise<boolean> => {
        return checkLlvmObjDumpOnPath();
    };

    private readonly loadEventsAndTestResults = async (): Promise<EventsAndTestLoadResult> => {
        try {
            const events = await this.getPredefinedEvents();
            const testResults = await this.getTestResults();
            return { type: 'success', events, testResults };
        } catch (error) {
            return this.buildErrorResult(error);
        }
    };

    private readonly buildErrorResult = async (error: unknown): Promise<ErrorResult> => {
        return {
            type: 'error',
            error: {
                type: await determineErrorType(error, this.checkWperfExists),
                message: (error as Error).message || 'Unknown error',
            },
        };
    };
}

export const determineErrorType = async (
    error: unknown,
    checkWperfExists = checkWperfExistsInSettingsOrPath,
): Promise<ErrorDetail['type']> => {
    if (error instanceof Error) {
        if (error.message.includes('No active device interfaces found.')) {
            return 'noWperfDriver';
        }
        if (error.message.includes('DeviceIoControl')) {
            return 'versionMismatch';
        }
        if (!(await checkWperfExists())) {
            return 'noWperf';
        } else {
            return 'unknown';
        }
    } else {
        return 'unknown';
    }
};

const promptUserForCommand = async (defaultUri: Uri | undefined): Promise<string | undefined> => {
    const maybeUris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        title: 'Select executable to sample',
        openLabel: 'Select',
        defaultUri,
    });

    const maybeUri = maybeUris?.[0];
    return maybeUri && asPathRelativeToFirstWorkspace(maybeUri, vscode.workspace.workspaceFolders);
};

export const asPathRelativeToFirstWorkspace = (
    fileUri: Uri,
    workspaceFolders: readonly Pick<WorkspaceFolder, 'uri'>[] | undefined,
): string => {
    const workspacePath = workspaceFolders?.[0]?.uri.fsPath;

    if (workspacePath) {
        const relativePath = path.relative(workspacePath, fileUri.fsPath);

        if (relativePath && !relativePath.startsWith('..')) {
            return relativePath;
        }
    }

    return fileUri.fsPath;
};
