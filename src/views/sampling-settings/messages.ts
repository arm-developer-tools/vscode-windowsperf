/**
 * Copyright (C) 2024 Arm Limited
 */

import * as z from 'zod';
import { recordOptionsShape } from '../../wperf/record-options';

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

export const toViewShape = z.object({
    type: z.literal('recordOptions'),
    recordOptions: recordOptionsShape,
});

export type ToView = z.infer<typeof toViewShape>;
