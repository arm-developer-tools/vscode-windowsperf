/**
 * Copyright (C) 2024 Arm Limited
 */

import { EventAndFrequency } from '../../../wperf/record-options';

type BaseState = {
    event: EventAndFrequency;
    validate: boolean;
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
    validate: false,
};

export type EventsEditorAction =
    | { type: 'cancel' }
    | { type: 'validate' }
    | { type: 'startEditing'; index: number }
    | { type: 'setEventName'; event: string }
    | { type: 'setFrequency'; frequency: number | undefined };

export const isEventEditorAction = (action: { type: string }): action is EventsEditorAction => {
    return ['cancel', 'validate', 'startEditing', 'setEventName', 'setFrequency'].includes(
        action.type,
    );
};

const startEditingReducer = (
    currentEvents: EventAndFrequency[],
    state: EventsEditorState,
    index: number,
): EventsEditorState => {
    const currentEvent = currentEvents[index];
    return currentEvent === undefined
        ? state
        : {
              type: 'editing',
              index: index,
              event: currentEvent,
              validate: false,
          };
};

export const eventsEditorReducer = (
    currentEvents: EventAndFrequency[],
    state: EventsEditorState,
    action: EventsEditorAction,
): EventsEditorState => {
    switch (action.type) {
        case 'cancel':
            return initialEventsEditorState;
        case 'startEditing':
            return startEditingReducer(currentEvents, state, action.index);
        case 'setEventName':
            return {
                ...state,
                event: { ...state.event, event: action.event },
                validate: false,
            };
        case 'setFrequency':
            return {
                ...state,
                event: { ...state.event, frequency: action.frequency },
                validate: false,
            };
        case 'validate':
            return { ...state, validate: true };
    }
};
