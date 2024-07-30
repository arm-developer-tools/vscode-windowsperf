/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { LoadedState, State, initialState, reducer } from './app';
import { ToView } from '../messages';
import { predefinedEventFactory } from '../../../wperf/parse/list.factories';
import { initialDataToViewFactory } from '../messages.factories';
import { loadedStateFactory } from './app.factories';
import { validatedFields } from '../../../wperf/record-options';

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
        const message: ToView = initialDataToViewFactory({
            events: { type: 'success', events },
            validate: true,
        });

        const got = reducer(initialState, {
            type: 'handleMessage',
            message,
        });

        const want: State = {
            type: 'loaded',
            cores: message.cores,
            recordOptions: message.recordOptions,
            events,
            fieldsToValidate: validatedFields,
        };
        expect(got).toEqual(want);
    });

    it('handles an initial data message with validation false by not setting fieldsToValidate', () => {
        const message: ToView = initialDataToViewFactory(
            initialDataToViewFactory({ validate: false }),
        );

        const got = reducer(initialState, {
            type: 'handleMessage',
            message,
        });

        expect((got as LoadedState).fieldsToValidate).toEqual([]);
    });

    it('handles a validate message', () => {
        const state = loadedStateFactory({ fieldsToValidate: ['events'] });
        const message: ToView = { type: 'validate' };

        const got = reducer(state, { type: 'handleMessage', message });

        const want: State = { ...state, fieldsToValidate: validatedFields };
        expect(got).toEqual(want);
    });

    it('handles an updateRecordOption action, resetting validation for that field', () => {
        const command = 'some command';

        const got = reducer(loadedStateFactory({ fieldsToValidate: ['command', 'events'] }), {
            type: 'setCommand',
            command,
        });

        expect(got.type).toBe('loaded');
        expect((got as LoadedState).recordOptions.command).toBe(command);
        expect((got as LoadedState).fieldsToValidate).toEqual(['events']);
    });
});
