/**
 * Copyright (C) 2024 Arm Limited
 */

export type PrintableError = {
    getDisplayMessage: () => string;
};

export const isPrintableError = (error: unknown): error is PrintableError => {
    return typeof (error as PrintableError).getDisplayMessage === 'function';
};

export const getLoggableError = (unknownError: unknown): string | Error => {
    if (isPrintableError(unknownError)) {
        return unknownError.getDisplayMessage();
    } else if (unknownError instanceof Error) {
        return unknownError;
    } else if (unknownError) {
        return String(unknownError);
    } else {
        return 'Unknown error';
    }
};
