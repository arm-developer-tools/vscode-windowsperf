/**
 * Copyright (C) 2024 Arm Limited
 */

import { EventAndFrequency } from '../../../wperf/record-options';

export type EventsEditorState = { event: EventAndFrequency };

export const initialEventsEditorState: EventsEditorState = {
    event: { event: '', frequency: undefined },
};

export type EventsEditorAction =
    | { type: 'cancel' }
    | { type: 'setEventName'; event: string }
    | { type: 'setFrequency'; frequency: number | undefined };

export const isEventEditorAction = (action: { type: string }): action is EventsEditorAction => {
    return ['cancel', 'setEventName', 'setFrequency'].includes(action.type);
};

export const eventsEditorReducer = (
    state: EventsEditorState,
    action: EventsEditorAction,
): EventsEditorState => {
    switch (action.type) {
        case 'cancel':
            return initialEventsEditorState;
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
