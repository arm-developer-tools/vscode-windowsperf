/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { SamplingSettingsWebview } from './main';
import * as vscode from 'vscode';
import { EventEmitter, Uri } from 'vscode';
import { faker } from '@faker-js/faker';
import { FromView, ToView } from './messages';
import { recordOptionsFactory } from '../../wperf/record-options.factories';

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

describe('SamplingSettingsWebview', () => {
    it('renders the webview on construction', () => {
        const distRoot = Uri.file(faker.system.directoryPath());
        const webview = webviewFactory();
        new SamplingSettingsWebview(distRoot, webview, { recordOptions: recordOptionsFactory() });

        expect(webview.html).toContain('<html>');
        expect(webview.html).toContain('sampling-settings.js');
        expect(webview.html).toContain(webview.asWebviewUri(distRoot).toString());
    });

    it('handles a ready message from the webview by sending the current record options', () => {
        const receiveMessageEmitter = new EventEmitter<FromView>();
        const recordOptions = recordOptionsFactory();
        const webview = webviewFactory(receiveMessageEmitter);
        new SamplingSettingsWebview(Uri.file(faker.system.directoryPath()), webview, {
            recordOptions,
        });

        receiveMessageEmitter.fire({ type: 'ready' });

        const want: ToView = { type: 'recordOptions', recordOptions };
        expect(webview.postMessage).toHaveBeenCalledWith(want);
    });

    it('updates the current record options in response to a recordOptions message', () => {
        const newRecordOptions = recordOptionsFactory();
        const receiveMessageEmitter = new EventEmitter<FromView>();
        const webview = webviewFactory(receiveMessageEmitter);
        new SamplingSettingsWebview(Uri.file(faker.system.directoryPath()), webview, {
            recordOptions: recordOptionsFactory(),
        });

        receiveMessageEmitter.fire({ type: 'recordOptions', recordOptions: newRecordOptions });

        expect(webview.postMessage).not.toHaveBeenCalled();
    });
});
