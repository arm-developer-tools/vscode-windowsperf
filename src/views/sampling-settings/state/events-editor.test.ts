/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import {
    EventsEditorAction,
    EventsEditorEditingState,
    eventsEditorReducer,
    EventsEditorState,
    isEventEditorAction,
} from './events-editor';
import { eventAndFrequencyFactory } from '../../../wperf/record-options.factories';
import { eventsEditorAddingStateFactory } from './events-editor.factories';
import { EventAndFrequency } from '../../../wperf/record-options';

describe('isEventEditorAction', () => {
    it.each([
        ['cancel', { type: 'cancel' }],
        ['startEditing', { type: 'startEditing', index: 0 }],
        ['setEventName', { type: 'setEventName', event: 'event' }],
        ['setFrequency', { type: 'setFrequency', frequency: 10000 }],
    ] as const)('returns true for %s actions', (_, action: EventsEditorAction) => {
        expect(isEventEditorAction(action)).toBe(true);
    });

    it('returns false for unknown actions', () => {
        const action = { type: 'unknown', field: 'value' };
        expect(isEventEditorAction(action)).toBe(false);
    });
});

describe('eventsEditorReducer', () => {
    it('handles a cancel action by returning to the empty adding state', () => {
        const got = eventsEditorReducer(
            [eventAndFrequencyFactory()],
            eventsEditorAddingStateFactory(),
            { type: 'cancel' },
        );

        const want: EventsEditorState = {
            type: 'adding',
            event: { event: '', frequency: undefined },
        };
        expect(got).toEqual(want);
    });

    it('handles a startEditing action by setting the editing state, preserving the current event', () => {
        const eventToEdit = eventAndFrequencyFactory();

        const got = eventsEditorReducer(
            [eventAndFrequencyFactory(), eventToEdit],
            {
                type: 'adding',
                event: { event: 'some_event', frequency: undefined },
            },
            { type: 'startEditing', index: 1 },
        );

        const want: EventsEditorState = {
            type: 'editing',
            index: 1,
            event: eventToEdit,
        };
        expect(got).toEqual(want);
    });

    it('handles a setEventName action by updating the event name', () => {
        const initialEvent: EventAndFrequency = { event: 'initialEvent', frequency: 3 };
        const initialState: EventsEditorEditingState = {
            type: 'editing',
            event: initialEvent,
            index: 0,
        };

        const got = eventsEditorReducer([eventAndFrequencyFactory()], initialState, {
            type: 'setEventName',
            event: 'newEvent',
        });

        const want: EventsEditorState = {
            ...initialState,
            event: { ...initialEvent, event: 'newEvent' },
        };
        expect(got).toEqual(want);
    });

    it('handles a setFrequency action by updating the frequency', () => {
        const initialEvent: EventAndFrequency = { event: 'initialEvent', frequency: 3 };
        const initialState: EventsEditorEditingState = {
            type: 'editing',
            event: initialEvent,
            index: 0,
        };

        const got = eventsEditorReducer([eventAndFrequencyFactory()], initialState, {
            type: 'setFrequency',
            frequency: 5,
        });

        const want: EventsEditorState = {
            ...initialState,
            event: { ...initialEvent, frequency: 5 },
        };
        expect(got).toEqual(want);
    });
});
