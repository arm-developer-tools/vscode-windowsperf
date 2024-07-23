/**
 * Copyright (C) 2024 Arm Limited
 */

import { z } from 'zod';

export const recordOptionsShape = z.object({
    events: z.array(z.string()),
    frequency: z.number(),
    core: z.number(),
    command: z.string(),
    arguments: z.string(),
    timeoutSeconds: z.number().optional(),
});

export type RecordOptions = z.infer<typeof recordOptionsShape>;

export const defaultRecordOptions: RecordOptions = {
    events: [],
    frequency: 10000,
    core: 0,
    command: '',
    arguments: '',
    timeoutSeconds: undefined,
};

export const validatedFields = ['events', 'command'] as const;
export type ValidatedField = (typeof validatedFields)[number];

export type RecordOptionsValidationResult = { missingFields: ValidatedField[] };

export const validateRecordOptions = (
    recordOptions: RecordOptions,
): RecordOptionsValidationResult => {
    const missingFields: ValidatedField[] = [];
    if (recordOptions.events.length === 0) {
        missingFields.push('events');
    }
    if (recordOptions.command === '') {
        missingFields.push('command');
    }
    return { missingFields };
};

export const buildRecordArgs = (options: RecordOptions): string => {
    const eventsArg = options.events.join(',') + ':' + options.frequency.toString();
    const timeoutArgs =
        options.timeoutSeconds === undefined
            ? []
            : ['--timeout', options.timeoutSeconds.toString()];

    return [
        'record',
        '-e',
        eventsArg,
        '-c',
        options.core.toString(),
        ...timeoutArgs,
        '--json',
        '--disassemble',
        '--',
        options.command,
        options.arguments,
    ].join(' ');
};
