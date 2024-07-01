/**
 * Copyright (C) 2024 Arm Limited
 */

import { Disposable, ExtensionContext, Uri, ViewColumn } from 'vscode';
import { logger } from '../logging/logger';
import * as vscode from 'vscode';
import { SamplingSettingsWebviewFactory } from '../views/sampling-settings/main';

type WebviewPanel = Pick<vscode.WebviewPanel, 'dispose' | 'onDidDispose' | 'reveal' | 'webview'>;
type Context = Pick<ExtensionContext, 'extensionUri' | 'subscriptions'>;

export class ShowSamplingSettings {
    private panel: WebviewPanel | undefined;

    constructor(
        private readonly context: Context,
        private readonly samplingSettingsWebviewFactory: SamplingSettingsWebviewFactory,
        private readonly createWebviewPanel = createSamplingSettingsWebviewPanel,
    ) {
        this.context.subscriptions.push(
            new Disposable(() => {
                this.panel?.dispose();
            }),
        );
    }

    readonly execute = async () => {
        logger.info('Executing windowsperf.showSamplingSettings');

        if (this.panel) {
            this.panel.reveal();
        } else {
            this.panel = this.createPanel();
        }
    };

    private readonly createPanel = (): WebviewPanel => {
        const distRoot = Uri.joinPath(this.context.extensionUri, 'dist');
        const panel = this.createWebviewPanel(distRoot);

        const samplingSettingsWebview = this.samplingSettingsWebviewFactory(
            distRoot,
            panel.webview,
        );

        panel.onDidDispose(() => {
            this.panel = undefined;
            samplingSettingsWebview.dispose();
        });

        return panel;
    };
}

const createSamplingSettingsWebviewPanel = (distRoot: Uri): WebviewPanel =>
    vscode.window.createWebviewPanel(
        'windowsperf.samplingSettings',
        'Sampling Settings',
        ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [distRoot],
        },
    );
