/**
 * Copyright (C) 2024 Arm Limited
 */

import { RecordOptions } from '../../../wperf/record-options';

export type UpdateRecordOptionAction =
    | { type: 'setCommand'; command: string }
    | { type: 'setArguments'; arguments: string }
    | { type: 'addEvent'; event: string }
    | { type: 'removeEvent'; event: string }
    | { type: 'setCore'; core: number }
    | { type: 'setTimeout'; timeout: string };

export const isUpdateRecordOptionAction = (action: {
    type: string;
}): action is UpdateRecordOptionAction => {
    return [
        'setCommand',
        'setArguments',
        'addEvent',
        'removeEvent',
        'setCore',
        'setTimeout',
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
        case 'removeEvent':
            return 'events';
        case 'setTimeout':
            return 'timeoutSeconds';
    }
};

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
                events: [...recordOptions.events, { event: action.event }],
            };
        case 'removeEvent':
            return {
                ...recordOptions,
                events: recordOptions.events.filter(({ event }) => event !== action.event),
            };
        case 'setCore':
            return { ...recordOptions, core: action.core };
        case 'setTimeout':
            return {
                ...recordOptions,
                timeoutSeconds:
                    action.timeout === '' ? undefined : Math.abs(parseInt(action.timeout)),
            };
    }
};
