/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { Action, LoadedState, State, initialState, reducer } from './app';
import { ToView } from '../messages';
import { predefinedEventFactory } from '../../../wperf/parse/list.factories';
import { initialDataToViewFactory } from '../messages.factories';
import { loadedStateFactory } from './app.factories';
import { validatedFields } from '../../../wperf/record-options';
import {
    eventAndFrequencyFactory,
    recordOptionsFactory,
} from '../../../wperf/record-options.factories';
import { updateRecentEvents } from '../../../recent-events';

describe('reducer', () => {
    it('handles an error initial data message', () => {
        const message: ToView = initialDataToViewFactory({
            events: { type: 'error', error: { type: 'noWperfDriver' } },
        });

        const got = reducer(initialState, {
            type: 'handleMessage',
            message,
        });

        const want: State = {
            type: 'error',
            error: { type: 'noWperfDriver' },
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
            recentEvents: message.recentEvents,
            recordOptions: message.recordOptions,
            events,
            fieldsToValidate: validatedFields,
        };
        expect(got).toEqual(want);
    });

    it('handles a retry action and sets the state to loading', () => {
        const stateBeforeRetry: State = {
            type: 'error',
            error: { type: 'noWperf' },
        };

        const action: Action = {
            type: 'retry',
        };

        const got = reducer(stateBeforeRetry, action);

        const want: State = {
            type: 'loading',
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

    it('handles an updateRecentEvents action by adding the events in the current record options to the recent events', () => {
        const recentEvents = ['recent event'];
        const recordOptions = recordOptionsFactory({ events: [eventAndFrequencyFactory()] });
        const state = loadedStateFactory({ recentEvents, recordOptions });

        const got = reducer(state, { type: 'updateRecentEvents' });

        expect(got.type).toBe('loaded');
        expect((got as LoadedState).recentEvents).toEqual(
            updateRecentEvents(recentEvents, recordOptions),
        );
    });
});
