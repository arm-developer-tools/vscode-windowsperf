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
