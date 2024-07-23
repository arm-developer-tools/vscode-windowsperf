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
    validate: jest.fn(),
});

describe('SamplingSettingsWebviewPanel', () => {
    it('creates the panel if it does not exist, passing the validate argument to the created webview', () => {
        const validate = true;
        const webviewPanel = webviewPanelFactory();
        const createWebviewPanel = jest.fn(() => webviewPanel);
        const webviewFactory = jest.fn(samplingSettingsWebviewFactory);
        const panel = new SamplingSettingsWebviewPanelImpl(
            contextFactory(),
            webviewFactory,
            createWebviewPanel,
        );

        panel.show(validate);

        expect(createWebviewPanel).toHaveBeenCalled();
        expect(webviewFactory).toHaveBeenCalledWith(
            expect.anything(),
            webviewPanel.webview,
            validate,
        );
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
        panel.show(false);

        panel.show(false);

        expect(createWebviewPanel).toHaveBeenCalledTimes(1);
        expect(webviewFactory).toHaveBeenCalledTimes(1);
        expect(webviewPanel.reveal).toHaveBeenCalled();
    });

    it('calls validate on the webview if the panel already exists and the validate argument is true', () => {
        const webviewPanel = webviewPanelFactory();
        const createWebviewPanel = jest.fn(() => webviewPanel);
        const samplingSettingsWebview = samplingSettingsWebviewFactory();
        const webviewFactory = jest.fn(() => samplingSettingsWebview);
        const panel = new SamplingSettingsWebviewPanelImpl(
            contextFactory(),
            webviewFactory,
            createWebviewPanel,
        );
        panel.show(false);

        panel.show(true);

        expect(samplingSettingsWebview.validate).toHaveBeenCalledTimes(1);
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
        panel.show(false);

        context.subscriptions.forEach((subscription) => subscription.dispose());

        expect(webviewPanel.dispose).toHaveBeenCalled();
    });
});
