/**
 * Copyright 2024 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
import { EventsEditorAction, eventsEditorReducer, initialEventsEditorState } from './events-editor';
import { eventsEditorEditingStateFactory } from './events-editor.factories';
import { testResultsFactory } from '../../../wperf/parse/test.factories';

describe('reducer', () => {
    it('handles an error initial data message', () => {
        const message: ToView = initialDataToViewFactory({
            eventsAndTestLoadResult: { type: 'error', error: { type: 'noWperfDriver' } },
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
        const testResults = testResultsFactory();
        const events = [predefinedEventFactory(), predefinedEventFactory()];
        const message: ToView = initialDataToViewFactory({
            eventsAndTestLoadResult: { type: 'success', testResults, events },
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
            testResults,
            events,
            fieldsToValidate: validatedFields,
            eventsEditor: initialEventsEditorState,
            hasLlvmObjDumpPath: false,
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

    it('handles an updateRecordOption action, resetting validation for that field and clearing the editor state', () => {
        const command = 'some command';

        const got = reducer(
            loadedStateFactory({
                fieldsToValidate: ['command', 'events'],
                eventsEditor: eventsEditorEditingStateFactory({
                    event: eventAndFrequencyFactory({ event: 'some_event' }),
                }),
            }),
            {
                type: 'setCommand',
                command,
            },
        );

        expect(got.type).toBe('loaded');
        expect((got as LoadedState).recordOptions.command).toBe(command);
        expect((got as LoadedState).fieldsToValidate).toEqual(['events']);
        expect((got as LoadedState).eventsEditor).toEqual(initialEventsEditorState);
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

    it('handles an events editor action', () => {
        const eventsEditor = initialEventsEditorState;
        const action: EventsEditorAction = { type: 'setFrequency', frequency: 1000 };
        const state = loadedStateFactory({ eventsEditor });

        const got = reducer(state, action);

        expect(got.type).toBe('loaded');
        expect((got as LoadedState).eventsEditor).toEqual(
            eventsEditorReducer(state.recordOptions.events, eventsEditor, action),
        );
    });
});
