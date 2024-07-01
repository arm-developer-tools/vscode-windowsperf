/**
 * Copyright (C) 2024 Arm Limited
 */

import { PredefinedEvent } from '../../wperf/parse/list';
import { RecordOptions } from '../../wperf/record-options';
import { ToView } from './messages';

export type LoadedState = {
    type: 'loaded';
    cores: never[];
    events: PredefinedEvent[];
    recordOptions: RecordOptions;
};

export type State =
    | { type: 'loading' }
    // TODO: Define error type
    | { type: 'error'; error: {} }
    | LoadedState;

export const initialState: State = { type: 'loading' };

export type Action =
    | { type: 'handleMessage'; message: ToView }
    | { type: 'setCommand'; command: string }
    | { type: 'setFrequency'; frequency: number };

const setRecordOptionsField = <K extends keyof RecordOptions>(
    field: K,
    value: RecordOptions[K],
    state: State,
): State => {
    if (state.type === 'loaded') {
        return {
            ...state,
            recordOptions: {
                ...state.recordOptions,
                [field]: value,
            },
        };
    } else {
        return state;
    }
};

const toViewMessageToState = (message: ToView): State => {
    if (message.events.type === 'error') {
        return {
            type: 'error',
            error: message.events.error,
        };
    } else {
        return {
            type: 'loaded',
            cores: message.cores,
            events: message.events.events,
            recordOptions: message.recordOptions,
        };
    }
};

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'handleMessage':
            return toViewMessageToState(action.message);
        case 'setCommand':
            return setRecordOptionsField('command', action.command, state);
        case 'setFrequency':
            return setRecordOptionsField('frequency', action.frequency, state);
    }
};
