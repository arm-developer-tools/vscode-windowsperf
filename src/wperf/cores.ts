/*
 * Copyright (c) 2024 Arm Limited
 */

import { cpus } from 'os';
import * as z from 'zod';

export const coreShape = z.object({
    number: z.number(),
    model: z.string(),
});
export type Core = z.infer<typeof coreShape>;

export const getCpuInfo = (): Core[] => {
    return cpus().map((cpu, index) => ({
        number: index,
        model: cpu.model,
    }));
};
