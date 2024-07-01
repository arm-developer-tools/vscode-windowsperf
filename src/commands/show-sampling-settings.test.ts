/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { ShowSamplingSettings } from './show-sampling-settings';
import { Disposable, EventEmitter, ExtensionContext, Uri, type Webview } from 'vscode';
import { faker } from '@faker-js/faker';

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

const disposableFactory = () => new Disposable(jest.fn());

describe('ShowSamplingSettings', () => {
    it('creates the panel if it does not exist', () => {
        const webviewPanel = webviewPanelFactory();
        const createWebviewPanel = jest.fn(() => webviewPanel);
        const webviewFactory = jest.fn(disposableFactory);
        const command = new ShowSamplingSettings(
            contextFactory(),
            webviewFactory,
            createWebviewPanel,
        );

        command.execute();

        expect(createWebviewPanel).toHaveBeenCalled();
        expect(webviewFactory).toHaveBeenCalledWith(expect.anything(), webviewPanel.webview);
    });

    it('reveals the panel if it exists', () => {
        const webviewPanel = webviewPanelFactory();
        const createWebviewPanel = jest.fn(() => webviewPanel);
        const webviewFactory = jest.fn(disposableFactory);
        const command = new ShowSamplingSettings(
            contextFactory(),
            webviewFactory,
            createWebviewPanel,
        );
        command.execute();

        command.execute();

        expect(createWebviewPanel).toHaveBeenCalledTimes(1);
        expect(webviewFactory).toHaveBeenCalledTimes(1);
        expect(webviewPanel.reveal).toHaveBeenCalled();
    });

    it('registers the panel for disposal', () => {
        const webviewPanel = webviewPanelFactory();
        const createWebviewPanel = jest.fn(() => webviewPanel);
        const webviewFactory = jest.fn(disposableFactory);
        const context = contextFactory();
        const command = new ShowSamplingSettings(context, webviewFactory, createWebviewPanel);
        command.execute();

        context.subscriptions.forEach((subscription) => subscription.dispose());

        expect(webviewPanel.dispose).toHaveBeenCalled();
    });
});
