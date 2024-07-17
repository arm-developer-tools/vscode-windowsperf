/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { LoadedState, State, initialState, reducer } from './reducer';
import { ToView } from './messages';
import { predefinedEventFactory } from '../../wperf/parse/list.factories';
import { initialDataToViewFactory } from './messages.factories';
import { loadedStateFactory } from './reducer.factories';

describe('reducer', () => {
    it('handles an error initial data message', () => {
        const message: ToView = initialDataToViewFactory({ events: { type: 'error', error: {} } });

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
        const events = [predefinedEventFactory(), predefinedEventFactory()];
        const message: ToView = initialDataToViewFactory({ events: { type: 'success', events } });

        const got = reducer(initialState, {
            type: 'handleMessage',
            message,
        });

        const want: State = {
            type: 'loaded',
            cores: message.cores,
            recordOptions: message.recordOptions,
            events,
        };
        expect(got).toEqual(want);
    });

    it('handles an updateRecordOption action', () => {
        const command = 'some command';

        const got = reducer(loadedStateFactory(), {
            type: 'updateRecordOption',
            key: 'command',
            value: command,
        });

        expect(got.type).toBe('loaded');
        expect((got as LoadedState).recordOptions.command).toBe(command);
    });
});
