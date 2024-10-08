/**
 * Copyright 2024 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { z } from 'zod';

const eventAndFrequencyShape = z.object({
    event: z.string(),
    frequency: z.number().optional(),
});

export type EventAndFrequency = z.infer<typeof eventAndFrequencyShape>;

export const recordOptionsShape = z.object({
    events: z.array(eventAndFrequencyShape),
    core: z.number(),
    command: z.string(),
    arguments: z.string(),
    timeoutSeconds: z.number().optional(),
    disassembleEnabled: z.boolean(),
});

export type RecordOptions = z.infer<typeof recordOptionsShape>;

export const getDefaultRecordOptions = (hasLlvmObjDumpPath: boolean): RecordOptions => {
    return {
        events: [],
        core: 0,
        command: '',
        arguments: '',
        disassembleEnabled: hasLlvmObjDumpPath,
    };
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

export const buildEventsParameter = (events: EventAndFrequency[]): string =>
    events
        .map((event) => {
            const frequencyString = event.frequency === undefined ? '' : `:${event.frequency}`;
            return `${event.event}${frequencyString}`;
        })
        .join(',');

export const buildRecordArgs = (
    options: RecordOptions,
    forceLock: boolean,
    // `forceLock` is not included in the RecordOptions type as storing this in local
    // storage causes issues with this value persisting between record runs.
): string => {
    const timeoutArgs =
        options.timeoutSeconds === undefined
            ? []
            : ['--timeout', options.timeoutSeconds.toString()];

    return [
        'record',
        '-e',
        buildEventsParameter(options.events),
        '-c',
        options.core.toString(),
        ...timeoutArgs,
        ...(forceLock ? ['--force-lock'] : []),
        '--json',
        options.disassembleEnabled ? '--disassemble' : '--annotate',
        '--',
        options.command,
        options.arguments,
    ].join(' ');
};
