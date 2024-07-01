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

const getPredefinedEventsFactory = (
    result = [predefinedEventFactory(), predefinedEventFactory()],
) => jest.fn(async () => result);

const waitTimeout = () => new Promise((resolve) => setTimeout(resolve, 5));

describe('SamplingSettingsWebview', () => {
    it('renders the webview on construction', () => {
        const distRoot = Uri.file(faker.system.directoryPath());
        const webview = webviewFactory();
        new SamplingSettingsWebview(
            distRoot,
            webview,
            { recordOptions: recordOptionsFactory() },
            getPredefinedEventsFactory(),
        );

        expect(webview.html).toContain('<html>');
        expect(webview.html).toContain('sampling-settings.js');
        expect(webview.html).toContain(webview.asWebviewUri(distRoot).toString());
    });

    it('handles a ready message from the webview by sending the initial data when the event load succeeds', async () => {
        const receiveMessageEmitter = new EventEmitter<FromView>();
        const recordOptions = recordOptionsFactory();
        const events: PredefinedEvent[] = [predefinedEventFactory(), predefinedEventFactory()];
        const webview = webviewFactory(receiveMessageEmitter);
        new SamplingSettingsWebview(
            Uri.file(faker.system.directoryPath()),
            webview,
            {
                recordOptions,
            },
            getPredefinedEventsFactory(events),
        );

        receiveMessageEmitter.fire({ type: 'ready' });
        await waitTimeout();

        const want: ToView = {
            type: 'initialData',
            recordOptions,
            cores: [],
            events: { type: 'success', events },
        };
        expect(webview.postMessage).toHaveBeenCalledWith(want);
    });

    it('handles a ready message from the webview by sending the initial data when the event load fails', async () => {
        const receiveMessageEmitter = new EventEmitter<FromView>();
        const recordOptions = recordOptionsFactory();
        const webview = webviewFactory(receiveMessageEmitter);
        const failingGetPredefinedEvents = jest.fn();
        failingGetPredefinedEvents.mockRejectedValue(new Error('Failed to load events'));
        new SamplingSettingsWebview(
            Uri.file(faker.system.directoryPath()),
            webview,
            {
                recordOptions,
            },
            failingGetPredefinedEvents,
        );

        receiveMessageEmitter.fire({ type: 'ready' });
        await waitTimeout();

        const want: ToView = {
            type: 'initialData',
            recordOptions,
            cores: [],
            events: { type: 'error', error: {} },
        };
        expect(webview.postMessage).toHaveBeenCalledWith(want);
    });

    it('updates the current record options in response to a recordOptions message', () => {
        const newRecordOptions = recordOptionsFactory();
        const receiveMessageEmitter = new EventEmitter<FromView>();
        const webview = webviewFactory(receiveMessageEmitter);
        new SamplingSettingsWebview(
            Uri.file(faker.system.directoryPath()),
            webview,
            {
                recordOptions: recordOptionsFactory(),
            },
            getPredefinedEventsFactory(),
        );

        receiveMessageEmitter.fire({ type: 'recordOptions', recordOptions: newRecordOptions });

        expect(webview.postMessage).not.toHaveBeenCalled();
    });
});
