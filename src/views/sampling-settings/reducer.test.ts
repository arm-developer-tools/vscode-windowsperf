/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { LoadedState, State, initialState, reducer } from './reducer';
import { recordOptionsFactory } from '../../wperf/record-options.factories';
import { ToView } from './messages';
import { PredefinedEvent } from '../../wperf/parse/list';
import { predefinedEventFactory } from '../../wperf/parse/list.factories';

describe('reducer', () => {
    it('handles an error initial data message', () => {
        const message: ToView = {
            type: 'initialData',
            cores: [],
            recordOptions: recordOptionsFactory(),
            events: { type: 'error', error: {} },
        };

        const got = reducer(initialState, {
            type: 'handleMessage',
            message,
        });

        const want: State = {
            type: 'error',
            error: {},
        };
        expect(got).toEqual(want);
    });

    it('handles a success initial data message', () => {
        const events: PredefinedEvent[] = [predefinedEventFactory()];
        const message: ToView = {
            type: 'initialData',
            cores: [],
            recordOptions: recordOptionsFactory(),
            events: { type: 'success', events },
        };

        const got = reducer(initialState, {
            type: 'handleMessage',
            message,
        });

        const want: State = {
            type: 'loaded',
            cores: message.cores,
            recordOptions: message.recordOptions,
            events: events,
        };
        expect(got).toEqual(want);
    });

    it('handles a set command action', () => {
        const command = 'some command';

        const got = reducer(
            {
                type: 'loaded',
                events: [],
                cores: [],
                recordOptions: recordOptionsFactory(),
            },
            { type: 'setCommand', command },
        );

        expect(got.type).toBe('loaded');
        expect((got as LoadedState).recordOptions.command).toBe(command);
    });

    it('handles a set frequency action', () => {
        const frequency = 42;

        const got = reducer(
            {
                type: 'loaded',
                events: [],
                cores: [],
                recordOptions: recordOptionsFactory(),
            },
            { type: 'setFrequency', frequency },
        );

        expect(got.type).toBe('loaded');
        expect((got as LoadedState).recordOptions.frequency).toBe(frequency);
    });
});
