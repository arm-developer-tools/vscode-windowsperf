/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import {
    EventsEditorAction,
    eventsEditorReducer,
    EventsEditorState,
    isEventEditorAction,
} from './events-editor';
import { EventAndFrequency } from '../../../wperf/record-options';
import { eventsEditorStateFactory } from './events-editor.factories';

describe('isEventEditorAction', () => {
    it.each([
        ['cancel', { type: 'cancel' }],
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
    it('handles a cancel action by returning to the empty state', () => {
        const got = eventsEditorReducer(eventsEditorStateFactory(), { type: 'cancel' });

        const want: EventsEditorState = {
            event: { event: '', frequency: undefined },
        };
        expect(got).toEqual(want);
    });

    it('handles a setEventName action by updating the event name', () => {
        const initialEvent: EventAndFrequency = { event: 'initialEvent', frequency: 3 };
        const initialState: EventsEditorState = { event: initialEvent };

        const got = eventsEditorReducer(initialState, { type: 'setEventName', event: 'newEvent' });

        const want: EventsEditorState = { event: { ...initialEvent, event: 'newEvent' } };
        expect(got).toEqual(want);
    });

    it('handles a setFrequency action by updating the frequency', () => {
        const initialEvent: EventAndFrequency = { event: 'initialEvent', frequency: 3 };
        const initialState: EventsEditorState = { event: initialEvent };

        const got = eventsEditorReducer(initialState, { type: 'setFrequency', frequency: 5 });

        const want: EventsEditorState = {
            ...initialState,
            event: { ...initialEvent, frequency: 5 },
        };
        expect(got).toEqual(want);
    });
});
