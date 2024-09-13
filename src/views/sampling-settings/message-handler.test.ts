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
import { testResultsFactory } from '../../wperf/parse/test.factories';
import { checkLlvmObjDumpOnPath } from '../../path';
import { generateSystemCheck } from '../../system-check/system-check';

const mockGenerateSystemCheck = generateSystemCheck as jest.Mock;
jest.mock('../../system-check/system-check', () => ({
    generateSystemCheck: jest.fn(),
}));

const mockCheckLlvmObjDumpOnPath = checkLlvmObjDumpOnPath as jest.Mock;
jest.mock('../../path', () => ({
    checkLlvmObjDumpOnPath: jest.fn(),
}));

const getPredefinedEventsFactory = (
    result = [predefinedEventFactory(), predefinedEventFactory()],
) => jest.fn(async () => result);

const getTestResultsFactory = (result = testResultsFactory()) => jest.fn(async () => result);

describe('message-handler', () => {
    beforeAll(() => {
        mockCheckLlvmObjDumpOnPath.mockResolvedValue(false);
    });
    describe('SamplingSettingsMessageHandlerImpl', () => {
        it('handles a ready message by sending the initial data when the event and test results load succeeds', async () => {
            const recordOptions = recordOptionsFactory();
            const recentEvents = ['recent_event'];
            const events: PredefinedEvent[] = [predefinedEventFactory(), predefinedEventFactory()];
            const testResults = testResultsFactory();
            const messageHandler = new MessageHandlerImpl(
                { value: recordOptions },
                false,
                { value: recentEvents },
                getPredefinedEventsFactory(events),
                getTestResultsFactory(testResults),
            );

            const message: FromView = { type: 'ready' };

            const got = await messageHandler.handleMessage(message);

            const want: ToView = {
                type: 'initialData',
                recordOptions,
                recentEvents,
                cores: expect.any(Object),
                eventsAndTestLoadResult: { type: 'success', testResults, events },
                validate: false,
                hasLlvmObjDumpPath: false,
            };
            expect(got).toEqual(want);
        });

        it('handles a ready message by sending the initial data when the initial load fails', async () => {
            const validateOnCreate = true;
            const recordOptions = recordOptionsFactory();
            const failingGetPredefinedEvents = jest.fn();
            failingGetPredefinedEvents.mockRejectedValue(new Error('Failed to load events'));
            const testResults = testResultsFactory();
            const checkWperfExists = jest.fn().mockResolvedValue(true);
            const messageHandler = new MessageHandlerImpl(
                { value: recordOptions },
                true,
                { value: [] },
                failingGetPredefinedEvents,
                getTestResultsFactory(testResults),
                jest.fn(),
                checkWperfExists,
            );
            const message: FromView = { type: 'ready' };

            const got = await messageHandler.handleMessage(message);

            const want: ToView = {
                type: 'initialData',
                recordOptions,
                recentEvents: [],
                cores: expect.any(Object),
                eventsAndTestLoadResult: {
                    type: 'error',
                    error: { type: 'unknown', message: 'Failed to load events' },
                },
                validate: validateOnCreate,
                hasLlvmObjDumpPath: false,
            };
            expect(got).toEqual(want);
        });

        it('successfully reloads wperf data and sends the initial data message on retry', async () => {
            const recordOptions = recordOptionsFactory();
            const recentEvents = ['recent_event'];
            const events: PredefinedEvent[] = [predefinedEventFactory(), predefinedEventFactory()];
            const testResults = testResultsFactory();
            const messageHandler = new MessageHandlerImpl(
                { value: recordOptions },
                false,
                { value: recentEvents },
                getPredefinedEventsFactory(events),
                getTestResultsFactory(testResults),
            );

            const message: FromView = { type: 'retry' };

            const got = await messageHandler.handleMessage(message);

            const want: ToView = {
                type: 'initialData',
                recordOptions,
                recentEvents,
                cores: expect.any(Object),
                eventsAndTestLoadResult: { type: 'success', events, testResults },
                validate: false,
                hasLlvmObjDumpPath: false,
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
                getTestResultsFactory(),
            );
            const message: FromView = recordOptionsFromViewFactory();

            const got = await messageHandler.handleMessage(message);

            expect(got).toBeUndefined();
            expect(recordOptionsStore.value).toEqual(message.recordOptions);
        });

        it('runs a system check when it is the message type', async () => {
            const recordOptionsStore = { value: recordOptionsFactory() };
            const messageHandler = new MessageHandlerImpl(
                recordOptionsStore,
                false,
                { value: [] },
                getPredefinedEventsFactory(),
                getTestResultsFactory(),
                jest.fn(),
            );
            const message: FromView = { type: 'runSystemCheck' };

            await messageHandler.handleMessage(message);

            expect(mockGenerateSystemCheck).toHaveBeenCalledTimes(1);
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
                    getPredefinedEventsFactory(),
                    getTestResultsFactory(),
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
                    getPredefinedEventsFactory(),
                    getTestResultsFactory(),
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
                    getPredefinedEventsFactory(),
                    getTestResultsFactory(),
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
        it("returns noWperf when wperf can't be found", async () => {
            const error = new Error();
            const checkWperfExists = jest.fn().mockResolvedValue(false);

            expect(await determineErrorType(error, checkWperfExists)).toBe('noWperf');
        });

        it('returns noWperfDriver when there is an issue with the wperf-driver', async () => {
            const error = new Error('No active device interfaces found.');
            expect(await determineErrorType(error)).toBe('noWperfDriver');
        });

        it('returns versionMismatch when there is version incompatibility between wperf and the wperf-driver', async () => {
            const error = new Error('DeviceIoControl');
            expect(await determineErrorType(error)).toBe('versionMismatch');
        });

        it("returns unknown when the wperf can be found and the error message isn't recognised", async () => {
            const error = new Error("I'm a teapot");
            const checkWperfExists = jest.fn().mockReturnValue(true);

            expect(await determineErrorType(error, checkWperfExists)).toBe('unknown');
        });
    });
});
