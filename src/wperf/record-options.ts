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
