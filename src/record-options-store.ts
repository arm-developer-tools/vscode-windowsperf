/**
 * Copyright (C) 2024 Arm Limited
 */

import { Memento } from 'vscode';
import { RecordOptions, recordOptionsShape } from './wperf/record-options';
import { logger } from './logging/logger';

export type RecordOptionsStore = {
    recordOptions: RecordOptions;
};

export class MementoRecordOptionsStore implements RecordOptionsStore {
    public static readonly mementoKey = 'record-options';

    constructor(private readonly memento: Pick<Memento, 'get' | 'update'>) {}

    get recordOptions(): RecordOptions {
        const storedRecordOptions = this.memento.get<unknown>(MementoRecordOptionsStore.mementoKey);
        if (storedRecordOptions) {
            const parseResult = recordOptionsShape.safeParse(storedRecordOptions);
            if (parseResult.success) {
                return parseResult.data;
            } else {
                logger.warn(
                    'Failed to parse stored record options, using defaults',
                    parseResult.error,
                    storedRecordOptions,
                );
            }
        }
        return defaultRecordOptions;
    }

    set recordOptions(recordOptions: RecordOptions) {
        this.memento.update(MementoRecordOptionsStore.mementoKey, recordOptions);
    }
}

export const defaultRecordOptions: RecordOptions = {
    events: [],
    frequency: 10000,
    core: 0,
    command: '',
    arguments: '',
    timeoutSeconds: undefined,
};
