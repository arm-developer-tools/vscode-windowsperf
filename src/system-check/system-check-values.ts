/**
 * Copyright (C) 2024 Arm Limited
 */

import { z } from 'zod';

export const systemCheckValueShape = z.object({
    name: z.string(),
    description: z.string(),
    isFound: z.boolean(),
});

export const systemCheckValuesShape = z.object({
    isWindowsOnArm: systemCheckValueShape,
    hasLlvmObjDumpOnPath: systemCheckValueShape,
    isWperfInstalled: systemCheckValueShape,
    isWperfDriverInstalled: systemCheckValueShape,
});

export type SystemCheckValues = z.infer<typeof systemCheckValuesShape>;
