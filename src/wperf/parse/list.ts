/**
 * Copyright (C) 2024 Arm Limited
 */

import * as z from 'zod';
import { validateAgainstShape } from './validate';

const predefinedEventShape = z.object({
    Alias_Name: z.string(),
    Description: z.string().optional(),
});

const listOutputShape = z.object({
    Predefined_Events: z.array(predefinedEventShape),
});

export type ListOutputJson = z.infer<typeof listOutputShape>;
export type PredefinedEvent = z.infer<typeof predefinedEventShape>;

export const parseListJson = (json: string): PredefinedEvent[] => {
    const data = JSON.parse(json);
    return validateAgainstShape(listOutputShape, data).Predefined_Events;
};
