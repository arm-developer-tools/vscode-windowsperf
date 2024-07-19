/**
 * Copyright (C) 2024 Arm Limited
 */

import { randomBytes } from 'crypto';
import * as vscode from 'vscode';
import { Disposable, Uri } from 'vscode';
import { SamplingSettingsMessageHandler } from './message-handler';

type Webview = Pick<
    vscode.Webview,
    'cspSource' | 'html' | 'asWebviewUri' | 'onDidReceiveMessage' | 'postMessage'
>;

export type SamplingSettingsWebview = {
    dispose: () => void;
};

export type SamplingSettingsWebviewFactory = (
    distRoot: Uri,
    webview: Webview,
) => SamplingSettingsWebview;

export class SamplingSettingsWebviewImpl implements SamplingSettingsWebview {
    private readonly messageListenerDisposable: Disposable;

    constructor(
        private readonly distRoot: Uri,
        private readonly webview: Webview,
        private readonly messageHandler: SamplingSettingsMessageHandler,
    ) {
        this.renderWebview(webview);
        this.messageListenerDisposable = webview.onDidReceiveMessage(this.handleMessage);
    }

    public readonly dispose = (): void => {
        this.messageListenerDisposable.dispose();
    };

    private readonly handleMessage = async (message: unknown): Promise<void> => {
        const maybeResponse = await this.messageHandler.handleMessage(message);

        if (maybeResponse) {
            this.webview.postMessage(maybeResponse);
        }
    };

    private readonly renderWebview = (webview: Webview): void => {
        const scriptName = 'sampling-settings.js';
        const viewsDirUri = Uri.joinPath(this.distRoot, 'views');
        const viewsWebviewUri = webview.asWebviewUri(viewsDirUri);
        const scriptUri = Uri.joinPath(viewsDirUri, scriptName);
        const scriptWebviewUri = webview.asWebviewUri(scriptUri);

        // Use a nonce for added security. Only scripts with this nonce will be loaded by the browser.
        const nonce = randomBytes(16).toString('base64');
        const cspSource = `${webview.cspSource} 'nonce-${nonce}'`;
        const contentSecurityPolicy = `default-src 'none'; font-src ${cspSource}; style-src 'unsafe-inline'; img-src ${cspSource} data:; script-src ${cspSource}`;

        // Webpack public path must end with a trailing slash
        const webpackPublicPath = `${viewsWebviewUri}/`;

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
