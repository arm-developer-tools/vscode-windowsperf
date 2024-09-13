/**
 * Copyright (C) 2024 Arm Limited
 */

import * as z from 'zod';
import { recordOptionsShape } from '../../wperf/record-options';
import { predefinedEventShape } from '../../wperf/parse/list';
import { coreShape } from '../../wperf/cores';
import { recentEventsShape } from '../../recent-events';
import { testResultsShape } from '../../wperf/parse/test';

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
    z.object({
        type: z.literal('showOutputChannel'),
    }),
    z.object({
        type: z.literal('runSystemCheck'),
    }),
    z.object({
        type: z.literal('retry'),
    }),
]);

export type FromView = z.infer<typeof fromViewShape>;

const errorTypeShape = z.enum(['noWperf', 'noWperfDriver', 'versionMismatch', 'unknown']);

const errorDetailShape = z.object({
    type: errorTypeShape,
    message: z.string().optional(),
});

export type ErrorDetail = z.infer<typeof errorDetailShape>;

const errorResultShape = z.object({
    type: z.literal('error'),
    error: errorDetailShape,
});

export type ErrorResult = z.infer<typeof errorResultShape>;

const eventsAndTestLoadResultShape = z.union([
    z.object({
        type: z.literal('success'),
        testResults: testResultsShape,
        events: z.array(predefinedEventShape),
    }),
    errorResultShape,
]);

export type EventsAndTestLoadResult = z.infer<typeof eventsAndTestLoadResultShape>;

export const toViewShape = z.union([
    z.object({
        type: z.literal('initialData'),
        recordOptions: recordOptionsShape,
        recentEvents: recentEventsShape,
        cores: z.array(coreShape),
        eventsAndTestLoadResult: eventsAndTestLoadResultShape,
        validate: z.boolean(),
        hasLlvmObjDumpPath: z.boolean(),
    }),
    z.object({
        type: z.literal('selectedCommand'),
        command: z.string(),
    }),
    z.object({ type: z.literal('validate') }),
]);

export type ToView = z.infer<typeof toViewShape>;
