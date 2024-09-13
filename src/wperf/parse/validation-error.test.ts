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
