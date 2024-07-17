/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { LoadedState, State, initialState, reducer, updateRecordOptionReducer } from './reducer';
import { ToView } from './messages';
import { predefinedEventFactory } from '../../wperf/parse/list.factories';
import { initialDataToViewFactory } from './messages.factories';
import { loadedStateFactory } from './reducer.factories';
import { recordOptionsFactory } from '../../wperf/record-options.factories';

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

        const got = reducer(loadedStateFactory(), { type: 'setCommand', command });

        expect(got.type).toBe('loaded');
        expect((got as LoadedState).recordOptions.command).toBe(command);
    });
});

describe('updateRecordOptionReducer', () => {
    it('handles an setCommand action', () => {
        const newCommand = 'newCommand';

        const got = updateRecordOptionReducer(recordOptionsFactory(), {
            type: 'setCommand',
            command: newCommand,
        });

        expect(got.command).toBe(newCommand);
    });

    it('handles an setArguments action', () => {
        const newArguments = '--new-arguments';

        const got = updateRecordOptionReducer(recordOptionsFactory(), {
            type: 'setArguments',
            arguments: newArguments,
        });

        expect(got.arguments).toBe(newArguments);
    });

    it('handles an addEvent action', () => {
        const initialEvent = 'event1';

        const got = updateRecordOptionReducer(recordOptionsFactory({ events: [initialEvent] }), {
            type: 'addEvent',
            event: 'event2',
        });

        expect(got.events).toEqual(expect.arrayContaining([initialEvent, 'event2']));
    });

    it('handles a removeEvent action', () => {
        const got = updateRecordOptionReducer(recordOptionsFactory({ events: ['event1'] }), {
            type: 'removeEvent',
            event: 'event1',
        });

        expect(got.events).toEqual([]);
    });
});
