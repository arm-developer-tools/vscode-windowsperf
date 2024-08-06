/**
 * Copyright (C) 2024 Arm Limited
 */

import { EventAndFrequency } from '../../../wperf/record-options';

type BaseState = {
    event: EventAndFrequency;
};

export type EventsEditorEditingState = {
    type: 'editing';
    index: number;
} & BaseState;

export type EventsEditorAddingState = {
    type: 'adding';
} & BaseState;

export type EventsEditorState = EventsEditorEditingState | EventsEditorAddingState;

export const initialEventsEditorState: EventsEditorState = {
    type: 'adding',
    event: { event: '', frequency: undefined },
};

export type EventsEditorAction =
    | { type: 'cancel' }
    | { type: 'startEditing'; index: number }
    | { type: 'setEventName'; event: string }
    | { type: 'setFrequency'; frequency: number | undefined };

export const isEventEditorAction = (action: { type: string }): action is EventsEditorAction => {
    return ['cancel', 'startEditing', 'setEventName', 'setFrequency'].includes(action.type);
};

export const eventsEditorReducer = (
    currentEvents: EventAndFrequency[],
    state: EventsEditorState,
    action: EventsEditorAction,
): EventsEditorState => {
    switch (action.type) {
        case 'cancel':
            return initialEventsEditorState;
        case 'startEditing': {
            const currentEvent = currentEvents[action.index];
            return currentEvent === undefined
                ? state
                : {
                      type: 'editing',
                      index: action.index,
                      event: currentEvent,
                  };
        }
        case 'setEventName':
            return {
                ...state,
                event: { ...state.event, event: action.event },
            };
        case 'setFrequency':
            return {
                ...state,
                event: { ...state.event, frequency: action.frequency },
            };
    }
};
