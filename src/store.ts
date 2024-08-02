/**
 * Copyright (C) 2024 Arm Limited
 */

import { Memento } from 'vscode';
import { logger } from './logging/logger';
import * as z from 'zod';

export type Store<V> = {
    value: V;
};

export class MementoStore<V> implements Store<V> {
    constructor(
        private readonly memento: Pick<Memento, 'get' | 'update'>,
        private readonly mementoKey: string,
        private readonly defaultValue: V,
        private readonly shape: z.ZodType<V>,
    ) {}

    get value(): V {
        const storedValue = this.memento.get<unknown>(this.mementoKey);
        if (storedValue) {
            const parseResult = this.shape.safeParse(storedValue);
            if (parseResult.success) {
                return parseResult.data;
            } else {
                logger.warn(
                    `Failed to parse stored value in ${this.mementoKey} key, using default`,
                    parseResult.error,
                    storedValue,
                );
            }
        }
        return this.defaultValue;
    }

    set value(recordOptions: V) {
        this.memento.update(this.mementoKey, recordOptions);
    }
}
