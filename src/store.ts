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
