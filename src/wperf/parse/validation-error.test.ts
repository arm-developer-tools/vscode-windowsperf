/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { ValidationError } from './validation-error';
import { ZodError, ZodIssueCode } from 'zod';

describe('ValidationError', () => {
    it('returns a message with all validation errors from getDisplayMessage', () => {
        const error = new ValidationError(
            new ZodError([
                {
                    path: ['testPath'],
                    message: 'I wanted a boolean but you gave me a string you rascal',
                    code: ZodIssueCode.invalid_type,
                    expected: 'boolean',
                    received: 'string',
                },
            ]),
        );

        const wantedMessage = `Parsed json does not match the schema
  {
    "_errors": [],
    "testPath": {
      "_errors": [
        "I wanted a boolean but you gave me a string you rascal"
      ]
    }
  }`;

        expect(error.getDisplayMessage()).toEqual(wantedMessage);
    });
});
