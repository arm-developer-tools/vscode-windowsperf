/**
 * Copyright (C) 2024 Arm Limited
 */

import * as z from 'zod';
import { validateAgainstShape } from './validate';

export const versionShape = z.object({
    Component: z.string(),
    Version: z.string(),
});

const versionOuputShape = z.object({
    Version: z.array(versionShape),
});

export type VersionOutputJson = z.infer<typeof versionOuputShape>;
export type Version = z.infer<typeof versionShape>;

export const parseVersionJson = (json: string): Version[] => {
    const data = JSON.parse(json);
    return validateAgainstShape(versionOuputShape, data).Version;
};
