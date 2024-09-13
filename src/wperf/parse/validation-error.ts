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

import { PrintableError } from '../../logging/printable-error';
import * as z from 'zod';

export class ValidationError<T> extends Error implements PrintableError {
    constructor(readonly zodError: z.ZodError<T>) {
        super('Parsed json does not match the schema');
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }

    readonly getDisplayMessage = () => {
        const zodErrorString = JSON.stringify(this.zodError.format(), null, 2);
        return `${this.message}\n${this.padLines(zodErrorString)}`;
    };

    readonly padLines = (message: string): string =>
        message
            .split('\n')
            .map((line) => `  ${line}`)
            .join('\n');
}
