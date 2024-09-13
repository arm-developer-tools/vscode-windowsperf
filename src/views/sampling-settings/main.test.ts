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
