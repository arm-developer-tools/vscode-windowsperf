/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { recordOptionsFactory } from '../../wperf/record-options.factories';
import { PredefinedEvent } from '../../wperf/parse/list';
import { predefinedEventFactory } from '../../wperf/parse/list.factories';
import { SamplingSettingsMessageHandlerImpl } from './message-handler';
import { FromView, ToView } from './messages';

const getPredefinedEventsFactory = (
    result = [predefinedEventFactory(), predefinedEventFactory()],
) => jest.fn(async () => result);

describe('SamplingSettingsMessageHandlerImpl', () => {
    it('handles a ready message by sending the initial data when the event load succeeds', async () => {
        const recordOptions = recordOptionsFactory();
        const events: PredefinedEvent[] = [predefinedEventFactory(), predefinedEventFactory()];
        const messageHandler = new SamplingSettingsMessageHandlerImpl(
            { recordOptions },
            getPredefinedEventsFactory(events),
        );

        const message: FromView = { type: 'ready' };

        const got = await messageHandler.handleMessage(message);

        const want: ToView = {
            type: 'initialData',
            recordOptions,
            cores: expect.any(Object),
            events: { type: 'success', events },
        };
        expect(got).toEqual(want);
    });

    it('handles a ready message by sending the initial data when the event load fails', async () => {
        const recordOptions = recordOptionsFactory();
        const failingGetPredefinedEvents = jest.fn();
        failingGetPredefinedEvents.mockRejectedValue(new Error('Failed to load events'));
        const messageHandler = new SamplingSettingsMessageHandlerImpl(
            { recordOptions },
            failingGetPredefinedEvents,
        );
        const message: FromView = { type: 'ready' };

        const got = await messageHandler.handleMessage(message);

        const want: ToView = {
            type: 'initialData',
            recordOptions,
            cores: expect.any(Object),
            events: { type: 'error', error: {} },
        };
        expect(got).toEqual(want);
    });

    it('updates the current record options and does not reply in response to a recordOptions message', async () => {
        const samplingSettings = { recordOptions: recordOptionsFactory() };
        const messageHandler = new SamplingSettingsMessageHandlerImpl(
            samplingSettings,
            getPredefinedEventsFactory(),
        );
        const newRecordOptions = recordOptionsFactory();
        const message: FromView = { type: 'recordOptions', recordOptions: newRecordOptions };

        const got = await messageHandler.handleMessage(message);

        expect(got).toBeUndefined();
        expect(samplingSettings.recordOptions).toEqual(newRecordOptions);
    });

    describe('handling openCommandFilePicker', () => {
        it('updates the sampling settings when the user picks a file', async () => {
            const newCommand = '/path/to/new-command';
            const promptForCommand = jest.fn();
            promptForCommand.mockResolvedValue(newCommand);
            const samplingSettings = { recordOptions: recordOptionsFactory() };
            const messageHandler = new SamplingSettingsMessageHandlerImpl(
                samplingSettings,
                jest.fn(),
                promptForCommand,
            );
            const message: FromView = { type: 'openCommandFilePicker' };

            await messageHandler.handleMessage(message);

            expect(samplingSettings.recordOptions.command).toBe(newCommand);
        });

        it('notifies the caller when the user picks a file', async () => {
            const newCommand = '/path/to/new-command';
            const promptForCommand = jest.fn();
            promptForCommand.mockResolvedValue(newCommand);
            const messageHandler = new SamplingSettingsMessageHandlerImpl(
                { recordOptions: recordOptionsFactory() },
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
            const samplingSettings = { recordOptions: initialRecordOptions };
            const messageHandler = new SamplingSettingsMessageHandlerImpl(
                samplingSettings,
                jest.fn(),
                promptForCommand,
            );
            const message: FromView = { type: 'openCommandFilePicker' };

            await messageHandler.handleMessage(message);

            expect(samplingSettings.recordOptions.command).toBe(initialRecordOptions.command);
        });
    });
});
