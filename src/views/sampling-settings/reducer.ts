/**
 * Copyright (C) 2024 Arm Limited
 */

import { Core } from '../../wperf/cores';
import { PredefinedEvent } from '../../wperf/parse/list';
import { RecordOptions } from '../../wperf/record-options';
import { ToView } from './messages';

export type LoadedState = {
    type: 'loaded';
    cores: Core[];
    events: PredefinedEvent[];
    recordOptions: RecordOptions;
};

export type State =
    | { type: 'loading' }
    // TODO: Define error type
    | { type: 'error'; error: {} }
    | LoadedState;

export const initialState: State = { type: 'loading' };

export type UpdateRecordOptionAction<K extends keyof RecordOptions> = {
    type: 'updateRecordOption';
    key: K;
    value: RecordOptions[K];
};

export type Action =
    | { type: 'handleMessage'; message: ToView }
    | UpdateRecordOptionAction<keyof RecordOptions>;

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

const toViewMessageReducer = (state: State, message: ToView): State => {
    switch (message.type) {
        case 'initialData':
            switch (message.events.type) {
                case 'error':
                    return {
                        type: 'error',
                        error: message.events.error,
                    };
                case 'success':
                    return {
                        type: 'loaded',
                        cores: message.cores,
                        events: message.events.events,
                        recordOptions: message.recordOptions,
                    };
            }
            break;
        case 'selectedCommand':
            return setRecordOptionsField('command', message.command, state);
    }
};

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'handleMessage':
            return toViewMessageReducer(state, action.message);
        case 'updateRecordOption':
            return setRecordOptionsField(action.key, action.value, state);
    }
};
