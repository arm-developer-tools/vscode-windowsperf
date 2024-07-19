/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { SamplingSettingsWebviewImpl } from './main';
import * as vscode from 'vscode';
import { EventEmitter, Uri } from 'vscode';
import { faker } from '@faker-js/faker';
import { FromView, ToView } from './messages';
import { recordOptionsFactory } from '../../wperf/record-options.factories';
import { predefinedEventFactory } from '../../wperf/parse/list.factories';
import { PredefinedEvent } from '../../wperf/parse/list';

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
        const recordOptions = recordOptionsFactory();
        const events: PredefinedEvent[] = [predefinedEventFactory(), predefinedEventFactory()];
        const webview = webviewFactory(receiveMessageEmitter);
        const want: ToView = {
            type: 'initialData',
            recordOptions,
            cores: expect.any(Object),
            events: { type: 'success', events },
        };
        new SamplingSettingsWebviewImpl(Uri.file(faker.system.directoryPath()), webview, {
            handleMessage: () => Promise.resolve(want),
        });

        receiveMessageEmitter.fire({ type: 'ready' });
        await waitTimeout();

        expect(webview.postMessage).toHaveBeenCalledWith(want);
    });
});
