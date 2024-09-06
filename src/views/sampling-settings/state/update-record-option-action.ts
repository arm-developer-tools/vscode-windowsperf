/**
 * Copyright (C) 2024 Arm Limited
 */

import { EventAndFrequency, RecordOptions } from '../../../wperf/record-options';

type EventAction =
    | { type: 'addEvent'; event: EventAndFrequency }
    | { type: 'editEvent'; index: number; event: EventAndFrequency }
    | { type: 'removeEvent'; index: number };

export type UpdateRecordOptionAction =
    | EventAction
    | { type: 'setCommand'; command: string }
    | { type: 'setArguments'; arguments: string }
    | { type: 'setCore'; core: number }
    | { type: 'setTimeout'; timeout: string }
    | { type: 'setDisassembleEnabled'; enabled: boolean };

export const isUpdateRecordOptionAction = (action: {
    type: string;
}): action is UpdateRecordOptionAction => {
    return [
        'setCommand',
        'setArguments',
        'addEvent',
        'editEvent',
        'removeEvent',
        'setCore',
        'setTimeout',
        'setDisassembleEnabled',
    ].includes(action.type);
};

export const getAffectedField = (action: UpdateRecordOptionAction): keyof RecordOptions => {
    switch (action.type) {
        case 'setCommand':
            return 'command';
        case 'setArguments':
            return 'arguments';
        case 'setCore':
            return 'core';
        case 'addEvent':
        case 'editEvent':
        case 'removeEvent':
            return 'events';
        case 'setTimeout':
            return 'timeoutSeconds';
        case 'setDisassembleEnabled':
            return 'disassembleEnabled';
    }
};

const eventReducer = (state: EventAndFrequency[], action: EventAction): EventAndFrequency[] => {
    switch (action.type) {
        case 'addEvent':
            return [...state, action.event];
        case 'removeEvent':
            return state.toSpliced(action.index, 1);
        case 'editEvent':
            return state.toSpliced(action.index, 1, action.event);
    }
};

export const updateRecordOptionReducer = (
    recordOptions: RecordOptions,
    action: UpdateRecordOptionAction,
): RecordOptions => {
    switch (action.type) {
        case 'addEvent':
        case 'removeEvent':
        case 'editEvent':
            return {
                ...recordOptions,
                events: eventReducer(recordOptions.events, action),
            };
        case 'setCommand':
            return { ...recordOptions, command: action.command };
        case 'setArguments':
            return { ...recordOptions, arguments: action.arguments };
        case 'setCore':
            return { ...recordOptions, core: action.core };
        case 'setTimeout':
            return {
                ...recordOptions,
                timeoutSeconds:
                    action.timeout === '' ? undefined : Math.abs(parseInt(action.timeout)),
            };
        case 'setDisassembleEnabled':
            return { ...recordOptions, disassembleEnabled: action.enabled };
    }
};
