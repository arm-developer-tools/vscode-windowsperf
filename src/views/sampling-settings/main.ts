/**
 * Copyright (C) 2024 Arm Limited
 */

import { randomBytes } from 'crypto';
import * as vscode from 'vscode';
import { Disposable, Uri } from 'vscode';
import { ToView, fromViewShape } from './messages';
import { logger } from '../../logging/logger';
import { SamplingSettings } from '../../sampling-settings';

type Webview = Pick<
    vscode.Webview,
    'cspSource' | 'html' | 'asWebviewUri' | 'onDidReceiveMessage' | 'postMessage'
>;

export type SamplingSettingsWebviewFactory = (distRoot: Uri, webview: Webview) => Disposable;

export class SamplingSettingsWebview {
    private readonly messageListenerDisposable: Disposable;

    constructor(
        private readonly distRoot: Uri,
        private readonly webview: Webview,
        private readonly samplingSettings: SamplingSettings,
    ) {
        this.renderWebview(webview);
        this.messageListenerDisposable = webview.onDidReceiveMessage(this.handleMessage);
    }

    public readonly dispose = (): void => {
        this.messageListenerDisposable.dispose();
    };

    private readonly handleMessage = (message: unknown): void => {
        const parseResult = fromViewShape.safeParse(message);

        if (parseResult.success) {
            const fromViewMessage = parseResult.data;
            logger.debug('Message from SamplingSettings view', fromViewMessage);

            switch (fromViewMessage.type) {
                case 'ready': {
                    const message: ToView = {
                        type: 'recordOptions',
                        recordOptions: this.samplingSettings.recordOptions,
                    };
                    this.webview.postMessage(message);
                    break;
                }
                case 'recordOptions':
                    this.samplingSettings.recordOptions = fromViewMessage.recordOptions;
                    break;
            }
        } else {
            logger.error('Received invalid message from webview', parseResult.error, message);
        }
    };

    private readonly renderWebview = (webview: Webview): void => {
        const scriptName = 'sampling-settings.js';
        const scriptUri = Uri.joinPath(this.distRoot, 'views', scriptName);
        const scriptWebviewUri = webview.asWebviewUri(scriptUri);

        // webview.cspSource does not include all CSP sources for VS Code Web
        const webviewUri = webview.asWebviewUri(this.distRoot);
        const baseSource = `${webviewUri.scheme}://${webviewUri.authority}`;
        const cspSource = `${webview.cspSource} ${baseSource}`;

        // Use a nonce for added security. Only scripts with this nonce will be loaded by the browser.
        const nonce = randomBytes(16).toString('base64');
        const contentSecurityPolicy = `default-src ${cspSource}; style-src ${cspSource}; img-src ${cspSource} data:; script-src 'nonce-${nonce}'`;

        // Webpack public path must end with a trailing slash
        const webpackPublicPath = `${webview.asWebviewUri(this.distRoot)}/`;

        webview.html = `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}">
                <title>Sampling Settings</title>
                <script nonce="${nonce}">
                    window.armPublicPath = '${webpackPublicPath}';
                    window.armNonce = '${nonce}';
                </script>
                <script defer nonce="${nonce}" src="${scriptWebviewUri}"></script>
            </head>
            <body></body>
            </html>`;
    };
}
