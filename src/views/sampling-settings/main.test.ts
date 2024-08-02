/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { SamplingSettingsWebviewImpl } from './main';
import * as vscode from 'vscode';
import { EventEmitter, Uri } from 'vscode';
import { faker } from '@faker-js/faker';
import { FromView, ToView } from './messages';
import { initialDataToViewFactory } from './messages.factories';

const webviewFactory = (
    receiveMessageEmitter = new EventEmitter<unknown>(),
): Pick<
    vscode.Webview,
    'asWebviewUri' | 'cspSource' | 'onDidReceiveMessage' | 'postMessage' | 'html'
> => ({
    asWebviewUri: (uri: Uri) => uri.with({ scheme: 'webview' }),
    cspSource: faker.internet.url(),
    html: '',
    postMessage: jest.fn(),
    onDidReceiveMessage: receiveMessageEmitter.event,
});

const waitTimeout = () => new Promise((resolve) => setTimeout(resolve, 5));

describe('SamplingSettingsWebview', () => {
    it('renders the webview on construction', () => {
        const distRoot = Uri.file(faker.system.directoryPath());
        const webview = webviewFactory();
        new SamplingSettingsWebviewImpl(distRoot, webview, { handleMessage: jest.fn() });

        expect(webview.html).toContain('<html>');
        expect(webview.html).toContain('sampling-settings.js');
        expect(webview.html).toContain(webview.asWebviewUri(distRoot).toString());
    });

    it('handles a message from the webview using the message handler', async () => {
        const receiveMessageEmitter = new EventEmitter<FromView>();
        const webview = webviewFactory(receiveMessageEmitter);
        const want: ToView = initialDataToViewFactory();
        new SamplingSettingsWebviewImpl(Uri.file(faker.system.directoryPath()), webview, {
            handleMessage: () => Promise.resolve(want),
        });

        receiveMessageEmitter.fire({ type: 'ready' });
        await waitTimeout();

        expect(webview.postMessage).toHaveBeenCalledWith(want);
    });

    it('sends a message to the webview when asked to validate', async () => {
        const webview = webviewFactory();
        const samplingSettingsWebview = new SamplingSettingsWebviewImpl(
            Uri.file(faker.system.directoryPath()),
            webview,
            {
                handleMessage: jest.fn(),
            },
        );
        samplingSettingsWebview.validate();

        const want: ToView = { type: 'validate' };
        expect(webview.postMessage).toHaveBeenCalledWith(want);
    });
});
