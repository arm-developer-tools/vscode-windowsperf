/**
 * Copyright (C) 2024 Arm Limited
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
