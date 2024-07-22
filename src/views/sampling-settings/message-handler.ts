/**
 * Copyright (C) 2024 Arm Limited
 */

import { Uri, WorkspaceFolder } from 'vscode';
import * as vscode from 'vscode';
import { logger } from '../../logging/logger';
import { RecordOptionsStore } from '../../record-options-store';
import { Core, getCpuInfo } from '../../wperf/cores';
import { RecordOptions } from '../../wperf/record-options';
import { runList } from '../../wperf/run';
import { EventsLoadResult, ToView, fromViewShape } from './messages';
import * as path from 'path';

export type MessageHandler = {
    handleMessage: (message: unknown) => Promise<ToView | undefined>;
};

export class MessageHandlerImpl implements MessageHandler {
    private readonly eventsPromise: Promise<EventsLoadResult>;

    constructor(
        private readonly recordOptionsStore: RecordOptionsStore,
        private readonly getPredefinedEvents = runList,
        private readonly promptForCommand = promptUserForCommand,
    ) {
        // Start loading while the webview content loads, to improve start up time
        this.eventsPromise = this.loadEvents();
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
            }
        } else {
            logger.error('Received invalid message from webview', parseResult.error, message);
        }

        return undefined;
    };

    private readonly handleOpenCommandFilePicker = async (): Promise<ToView | undefined> => {
        const currentCommand = this.recordOptionsStore.recordOptions.command;
        const defaultUri = path.isAbsolute(currentCommand)
            ? Uri.file(path.dirname(currentCommand))
            : undefined;

        const command = await this.promptForCommand(defaultUri);

        if (command) {
            this.recordOptionsStore.recordOptions = {
                ...this.recordOptionsStore.recordOptions,
                command,
            };

            return { type: 'selectedCommand', command };
        }

        return undefined;
    };

    public readonly handleReady = async (): Promise<ToView> => {
        return {
            type: 'initialData',
            recordOptions: this.recordOptionsStore.recordOptions,
            cores: this.listCores(),
            events: await this.eventsPromise,
        };
    };

    public readonly handleRecordOptions = async (
        recordOptions: RecordOptions,
    ): Promise<undefined> => {
        this.recordOptionsStore.recordOptions = recordOptions;
        return undefined;
    };

    private readonly listCores = (): Core[] => {
        return getCpuInfo();
    };

    private readonly loadEvents = async (): Promise<EventsLoadResult> => {
        try {
            const events = await this.getPredefinedEvents();
            return { type: 'success', events };
        } catch (error) {
            return { type: 'error', error: {} };
        }
    };
}

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
