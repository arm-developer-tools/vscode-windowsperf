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

export type UpdateRecordOptionAction =
    | { type: 'setCommand'; command: string }
    | { type: 'setArguments'; arguments: string }
    | { type: 'addEvent'; event: string }
    | { type: 'removeEvent'; event: string };

export type Action = { type: 'handleMessage'; message: ToView } | UpdateRecordOptionAction;

export const updateRecordOptionReducer = (
    recordOptions: RecordOptions,
    action: UpdateRecordOptionAction,
): RecordOptions => {
    switch (action.type) {
        case 'setCommand':
            return { ...recordOptions, command: action.command };
        case 'setArguments':
            return { ...recordOptions, arguments: action.arguments };
        case 'addEvent':
            return {
                ...recordOptions,
                events: [...recordOptions.events, action.event],
            };
        case 'removeEvent':
            return {
                ...recordOptions,
                events: recordOptions.events.filter((e) => e !== action.event),
            };
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
            return state.type === 'loaded'
                ? { ...state, recordOptions: { ...state.recordOptions, command: message.command } }
                : state;
    }
};

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'handleMessage':
            return toViewMessageReducer(state, action.message);
        case 'setCommand':
        case 'setArguments':
        case 'addEvent':
        case 'removeEvent':
            if (state.type === 'loaded') {
                return {
                    ...state,
                    recordOptions: updateRecordOptionReducer(state.recordOptions, action),
                };
            } else {
                return state;
            }
    }
};
