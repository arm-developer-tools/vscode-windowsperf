/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { EventEmitter, ExtensionContext, Uri, type Webview } from 'vscode';
import { faker } from '@faker-js/faker';
import { SamplingSettingsWebview } from './main';
import { SamplingSettingsWebviewPanelImpl } from './panel';

const contextFactory = (): Pick<ExtensionContext, 'extensionUri' | 'subscriptions'> => ({
    extensionUri: Uri.parse(faker.system.directoryPath()),
    subscriptions: [],
});

const webviewPanelFactory = (disposeEmitter = new EventEmitter<void>()) => ({
    dispose: jest.fn(),
    onDidDispose: disposeEmitter.event,
    reveal: jest.fn(),
    webview: {} as Webview,
});

const samplingSettingsWebviewFactory = (): jest.Mocked<SamplingSettingsWebview> => ({
    dispose: jest.fn(),
});

describe('SamplingSettingsWebviewPanel', () => {
    it('creates the panel if it does not exist', () => {
        const webviewPanel = webviewPanelFactory();
        const createWebviewPanel = jest.fn(() => webviewPanel);
        const webviewFactory = jest.fn(samplingSettingsWebviewFactory);
        const panel = new SamplingSettingsWebviewPanelImpl(
            contextFactory(),
            webviewFactory,
            createWebviewPanel,
        );

        panel.show();

        expect(createWebviewPanel).toHaveBeenCalled();
        expect(webviewFactory).toHaveBeenCalledWith(expect.anything(), webviewPanel.webview);
    });

    it('reveals the panel if it exists', () => {
        const webviewPanel = webviewPanelFactory();
        const createWebviewPanel = jest.fn(() => webviewPanel);
        const webviewFactory = jest.fn(samplingSettingsWebviewFactory);
        const panel = new SamplingSettingsWebviewPanelImpl(
            contextFactory(),
            webviewFactory,
            createWebviewPanel,
        );
        panel.show();

        panel.show();

        expect(createWebviewPanel).toHaveBeenCalledTimes(1);
        expect(webviewFactory).toHaveBeenCalledTimes(1);
        expect(webviewPanel.reveal).toHaveBeenCalled();
    });

    it('registers the panel for disposal', () => {
        const webviewPanel = webviewPanelFactory();
        const createWebviewPanel = jest.fn(() => webviewPanel);
        const context = contextFactory();
        const panel = new SamplingSettingsWebviewPanelImpl(
            context,
            samplingSettingsWebviewFactory,
            createWebviewPanel,
        );
        panel.show();

        context.subscriptions.forEach((subscription) => subscription.dispose());

        expect(webviewPanel.dispose).toHaveBeenCalled();
    });
});
