/**
 * Copyright (C) 2024 Arm Limited
 */

import * as z from 'zod';
import { recordOptionsShape } from '../../wperf/record-options';
import { predefinedEventShape } from '../../wperf/parse/list';
import { coreShape } from '../../wperf/cores';

export const fromViewShape = z.union([
    z.object({
        type: z.literal('record'),
    }),
    z.object({
        type: z.literal('recordOptions'),
        recordOptions: recordOptionsShape,
    }),
    z.object({
        type: z.literal('openCommandFilePicker'),
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

export const toViewShape = z.union([
    z.object({
        type: z.literal('initialData'),
        recordOptions: recordOptionsShape,
        cores: z.array(coreShape),
        events: eventsLoadResultShape,
        validate: z.boolean(),
    }),
    z.object({
        type: z.literal('selectedCommand'),
        command: z.string(),
    }),
    z.object({ type: z.literal('validate') }),
]);

export type ToView = z.infer<typeof toViewShape>;
