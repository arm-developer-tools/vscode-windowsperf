/**
 * Copyright (C) 2024 Arm Limited
 */

import * as z from 'zod';
import { recordOptionsShape } from '../../wperf/record-options';
import { predefinedEventShape } from '../../wperf/parse/list';

export const fromViewShape = z.union([
    z.object({
        type: z.literal('recordOptions'),
        recordOptions: recordOptionsShape,
    }),
    z.object({
        type: z.literal('ready'),
    }),
]);

export type FromView = z.infer<typeof fromViewShape>;

const eventsLoadResultShape = z.union([
    z.object({
        type: z.literal('success'),
        events: z.array(predefinedEventShape),
    }),
    z.object({
        type: z.literal('error'),
        // TODO: Define error type
        error: z.object({}),
    }),
]);

export type EventsLoadResult = z.infer<typeof eventsLoadResultShape>;

// TODO: Define core type
const coreShape = z.NEVER;
export type Core = z.infer<typeof coreShape>;

export const toViewShape = z.object({
    type: z.literal('initialData'),
    recordOptions: recordOptionsShape,
    cores: z.array(coreShape),
    events: eventsLoadResultShape,
});

export type ToView = z.infer<typeof toViewShape>;
