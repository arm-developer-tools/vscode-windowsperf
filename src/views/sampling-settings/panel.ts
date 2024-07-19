/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { SamplingSettingsWebview, SamplingSettingsWebviewFactory } from './main';
import { Disposable, Uri, ViewColumn } from 'vscode';

type WebviewPanel = Pick<vscode.WebviewPanel, 'dispose' | 'onDidDispose' | 'reveal' | 'webview'>;
type ExtensionContext = Pick<vscode.ExtensionContext, 'extensionUri' | 'subscriptions'>;

type PanelAndView = {
    panel: WebviewPanel;
    webview: SamplingSettingsWebview;
};

export type SamplingSettingsWebviewPanel = {
    show: () => void;
};

export class SamplingSettingsWebviewPanelImpl implements SamplingSettingsWebviewPanel {
    private panelAndView: PanelAndView | undefined;

    constructor(
        private readonly context: ExtensionContext,
        private readonly samplingSettingsWebviewFactory: SamplingSettingsWebviewFactory,
        private readonly createWebviewPanel = createSamplingSettingsWebviewPanel,
    ) {
        this.context.subscriptions.push(
            new Disposable(() => {
                this.panelAndView?.panel.dispose();
            }),
        );
    }

    public readonly show = () => {
        if (this.panelAndView) {
            this.panelAndView.panel.reveal();
        } else {
            this.panelAndView = this.createPanelAndView();
        }
    };

    private readonly createPanelAndView = (): PanelAndView => {
        const distRoot = Uri.joinPath(this.context.extensionUri, 'dist');
        const mediaDir = Uri.joinPath(this.context.extensionUri, 'media');
        const panel = this.createWebviewPanel({ distRoot, mediaDir });

        const samplingSettingsWebview = this.samplingSettingsWebviewFactory(
            distRoot,
            panel.webview,
        );

        panel.onDidDispose(() => {
            this.panelAndView = undefined;
            samplingSettingsWebview.dispose();
        });

        return {
            panel,
            webview: samplingSettingsWebview,
        };
    };
}

const createSamplingSettingsWebviewPanel = (uris: {
    distRoot: Uri;
    mediaDir: Uri;
}): WebviewPanel => {
    const panel = vscode.window.createWebviewPanel(
        'windowsperf.samplingSettings',
        'Sampling Settings',
        ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [uris.distRoot],
        },
    );
    panel.iconPath = {
        light: vscode.Uri.joinPath(uris.mediaDir, 'settings-light.svg'),
        dark: vscode.Uri.joinPath(uris.mediaDir, 'settings-dark.svg'),
    };
    return panel;
};
