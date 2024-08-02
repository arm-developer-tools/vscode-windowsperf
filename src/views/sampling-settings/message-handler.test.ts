/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { recordOptionsFactory } from '../../wperf/record-options.factories';
import { PredefinedEvent } from '../../wperf/parse/list';
import { predefinedEventFactory } from '../../wperf/parse/list.factories';
import {
    MessageHandlerImpl,
    asPathRelativeToFirstWorkspace,
    determineErrorType,
} from './message-handler';
import { FromView, ToView } from './messages';
import { recordOptionsFromViewFactory } from './messages.factories';
import { faker } from '@faker-js/faker';
import { Uri } from 'vscode';
import path from 'path';

const getPredefinedEventsFactory = (
    result = [predefinedEventFactory(), predefinedEventFactory()],
) => jest.fn(async () => result);

describe('SamplingSettingsMessageHandlerImpl', () => {
    it('handles a ready message by sending the initial data when the event load succeeds', async () => {
        const recordOptions = recordOptionsFactory();
        const recentEvents = ['recent_event'];
        const events: PredefinedEvent[] = [predefinedEventFactory(), predefinedEventFactory()];
        const messageHandler = new MessageHandlerImpl(
            { value: recordOptions },
            false,
            { value: recentEvents },
            getPredefinedEventsFactory(events),
        );

        const message: FromView = { type: 'ready' };

        const got = await messageHandler.handleMessage(message);

        const want: ToView = {
            type: 'initialData',
            recordOptions,
            recentEvents,
            cores: expect.any(Object),
            events: { type: 'success', events },
            validate: false,
        };
        expect(got).toEqual(want);
    });

    it('handles a ready message by sending the initial data when the event load fails', async () => {
        const validateOnCreate = true;
        const recordOptions = recordOptionsFactory();
        const failingGetPredefinedEvents = jest.fn();
        failingGetPredefinedEvents.mockRejectedValue(new Error('Failed to load events'));
        const messageHandler = new MessageHandlerImpl(
            { value: recordOptions },
            true,
            { value: [] },
            failingGetPredefinedEvents,
        );
        const message: FromView = { type: 'ready' };

        const got = await messageHandler.handleMessage(message);

        const want: ToView = {
            type: 'initialData',
            recordOptions,
            recentEvents: [],
            cores: expect.any(Object),
            events: { type: 'error', error: { type: 'unknown', message: 'Failed to load events' } },
            validate: validateOnCreate,
        };
        expect(got).toEqual(want);
    });

    it('updates the current record options and does not reply in response to a recordOptions message', async () => {
        const recordOptionsStore = { value: recordOptionsFactory() };
        const messageHandler = new MessageHandlerImpl(
            recordOptionsStore,
            false,
            { value: [] },
            getPredefinedEventsFactory(),
        );
        const message: FromView = recordOptionsFromViewFactory();

        const got = await messageHandler.handleMessage(message);

        expect(got).toBeUndefined();
        expect(recordOptionsStore.value).toEqual(message.recordOptions);
    });

    describe('handling openCommandFilePicker', () => {
        it('updates the sampling settings when the user picks a file', async () => {
            const newCommand = '/path/to/new-command';
            const promptForCommand = jest.fn();
            promptForCommand.mockResolvedValue(newCommand);
            const recordOptionsStore = { value: recordOptionsFactory() };
            const messageHandler = new MessageHandlerImpl(
                recordOptionsStore,
                false,
                { value: [] },
                jest.fn(),
                promptForCommand,
            );
            const message: FromView = { type: 'openCommandFilePicker' };

            await messageHandler.handleMessage(message);

            expect(recordOptionsStore.value.command).toBe(newCommand);
        });

        it('notifies the caller when the user picks a file', async () => {
            const newCommand = '/path/to/new-command';
            const promptForCommand = jest.fn();
            promptForCommand.mockResolvedValue(newCommand);
            const messageHandler = new MessageHandlerImpl(
                { value: recordOptionsFactory() },
                false,
                { value: [] },
                jest.fn(),
                promptForCommand,
            );
            const message: FromView = { type: 'openCommandFilePicker' };

            const got = await messageHandler.handleMessage(message);

            const want: ToView = { type: 'selectedCommand', command: newCommand };
            expect(got).toEqual(want);
        });

        it('does nothing when the user does not pick a file', async () => {
            const promptForCommand = jest.fn();
            promptForCommand.mockResolvedValue(undefined);
            const initialRecordOptions = recordOptionsFactory();
            const recordOptionsStore = { value: initialRecordOptions };
            const messageHandler = new MessageHandlerImpl(
                recordOptionsStore,
                false,
                { value: [] },

                jest.fn(),
                promptForCommand,
            );
            const message: FromView = { type: 'openCommandFilePicker' };

            await messageHandler.handleMessage(message);

            expect(recordOptionsStore.value.command).toBe(initialRecordOptions.command);
        });
    });
});

describe('asPathRelativeToFirstWorkspace', () => {
    it('returns the absolute path when no workspaces are open', () => {
        const inputUri = Uri.file(faker.system.filePath());

        const got = asPathRelativeToFirstWorkspace(inputUri, undefined);

        expect(got).toBe(inputUri.fsPath);
    });

    it('returns the absolute path when there is no first workspace', () => {
        const inputUri = Uri.file(faker.system.filePath());

        const got = asPathRelativeToFirstWorkspace(inputUri, []);

        expect(got).toBe(inputUri.fsPath);
    });

    it('returns the absolute path when the file is not inside the first workspace', () => {
        const inputUri = Uri.file(faker.system.filePath());

        const got = asPathRelativeToFirstWorkspace(inputUri, [
            { uri: Uri.file(path.join('path', 'to', 'directory1')) },
            { uri: Uri.file(path.join('path', 'to', 'directory2')) },
        ]);

        expect(got).toBe(inputUri.fsPath);
    });

    it('returns a relative path when the file is inside the first workspace', () => {
        const fileName = 'file.txt';
        const firstWorkspaceUri = Uri.file(faker.system.directoryPath());
        const inputUri = Uri.joinPath(firstWorkspaceUri, fileName);

        const got = asPathRelativeToFirstWorkspace(inputUri, [
            { uri: firstWorkspaceUri },
            { uri: Uri.file(faker.system.directoryPath()) },
        ]);

        expect(got).toBe(fileName);
    });
});

describe('determineErrorType', () => {
    it('returns noWperfDriver when there is an issue with the wperf-driver', () => {
        const error = new Error('not recognised as an internal or external command');
        expect(determineErrorType(error)).toBe('noWperf');
    });
    it('returns noWperf when the WindowsPerf executable cannot be found', () => {
        const error = new Error('No active device interfaces found.');
        expect(determineErrorType(error)).toBe('noWperfDriver');
    });
});
