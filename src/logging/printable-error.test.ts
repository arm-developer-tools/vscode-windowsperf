/**
 * Copyright (C) 2024 Arm Limited
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
