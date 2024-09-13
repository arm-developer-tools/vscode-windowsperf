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
import { PrintableError, getLoggableError } from './printable-error';

describe('getLoggableError', () => {
    it('returns the error message if the error is a string', () => {
        const errorMessage = 'Something went wrong';
        const result = getLoggableError(errorMessage);
        expect(result).toBe(errorMessage);
    });

    it('returns the error if the error is an Error object', () => {
        const error = new Error('Something went wrong');
        const result = getLoggableError(error);
        expect(result).toBe(error);
    });

    it('returns the display message if the error is a PrintableError', () => {
        const error: PrintableError = {
            getDisplayMessage: () => 'I am a printable error',
        };
        const result = getLoggableError(error);
        expect(result).toBe('I am a printable error');
    });
});
