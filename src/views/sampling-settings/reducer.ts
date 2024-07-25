/**
 * Copyright (C) 2024 Arm Limited
 */

import { Core } from '../../wperf/cores';
import { PredefinedEvent } from '../../wperf/parse/list';
import { RecordOptions, ValidatedField, validatedFields } from '../../wperf/record-options';
import { ToView } from './messages';

export type LoadedState = {
    type: 'loaded';
    cores: Core[];
    events: PredefinedEvent[];
    recordOptions: RecordOptions;
    fieldsToValidate: readonly ValidatedField[];
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
    | { type: 'removeEvent'; event: string }
    | { type: 'setCore'; core: number };

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
        case 'setCore':
            return { ...recordOptions, core: action.core };
    }
};

const initialDataToState = (message: Extract<ToView, { type: 'initialData' }>): State => {
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
                fieldsToValidate: message.validate ? validatedFields : [],
            };
    }
};

const toViewMessageReducer = (state: State, message: ToView): State => {
    switch (message.type) {
        case 'initialData':
            return initialDataToState(message);
        case 'selectedCommand':
            return state.type === 'loaded'
                ? { ...state, recordOptions: { ...state.recordOptions, command: message.command } }
                : state;
        case 'validate':
            return state.type === 'loaded'
                ? { ...state, fieldsToValidate: validatedFields }
                : state;
    }
};

const getAffectedField = (action: UpdateRecordOptionAction): keyof RecordOptions => {
    switch (action.type) {
        case 'setCommand':
            return 'command';
        case 'setArguments':
            return 'arguments';
        case 'setCore':
            return 'core';
        case 'addEvent':
        case 'removeEvent':
            return 'events';
    }
};

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'handleMessage':
            return toViewMessageReducer(state, action.message);
        case 'setCommand':
        case 'setArguments':
        case 'addEvent':
        case 'setCore':
        case 'removeEvent':
            if (state.type === 'loaded') {
                const affectedField = getAffectedField(action);

                return {
                    ...state,
                    recordOptions: updateRecordOptionReducer(state.recordOptions, action),
                    fieldsToValidate: state.fieldsToValidate.filter(
                        (field) => field !== affectedField,
                    ),
                };
            } else {
                return state;
            }
    }
};
