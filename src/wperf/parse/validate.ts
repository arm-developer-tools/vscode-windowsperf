/**
 * Copyright (C) 2024 Arm Limited
 */

import * as z from 'zod';
import { ValidationError } from './validation-error';

export const validateAgainstShape = <T>(shape: z.ZodType<T>, data: unknown): T => {
    const result = shape.safeParse(data);
    if (result.success) {
        return result.data;
    } else {
        throw new ValidationError(result.error);
    }
};
