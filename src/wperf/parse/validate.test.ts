/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as z from 'zod';
import { validateAgainstShape } from './validate';
import { ValidationError } from './validation-error';

const testShape = z.object({
    foo: z.string(),
    bar: z.number(),
});

describe('validateAgainstShape', () => {
    it('returns the data if it matches the shape', () => {
        const input = { foo: 'hello', bar: 42 };

        const got = validateAgainstShape(testShape, input);

        expect(got).toEqual(input);
    });

    it('throws a ValidationError if the data does not match the shape', () => {
        const input = { foo: 'hello', bar: 'world' };

        expect(() => validateAgainstShape(testShape, input)).toThrow(ValidationError);
    });
});
