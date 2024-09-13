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
import type { Memento } from 'vscode';
import { MementoStore } from './store';
import * as z from 'zod';

const mementoFactory = (): jest.Mocked<Pick<Memento, 'get' | 'update'>> => ({
    get: jest.fn(),
    update: jest.fn(),
});

describe('Store', () => {
    it('returns the default value when the memento is empty', () => {
        const memento = mementoFactory();
        memento.get.mockReturnValue(undefined);
        const defaultValue = 'defaultValue';
        const store = new MementoStore(memento, 'key', defaultValue, z.string());

        const got = store.value;

        expect(got).toEqual(defaultValue);
    });

    it('returns the stored value when the memento is not empty', () => {
        const storedValue = 'storedValue';
        const memento = mementoFactory();
        memento.get.mockReturnValue(storedValue);
        const store = new MementoStore(memento, 'key', 'defaultValue', z.string());

        const got = store.value;

        expect(got).toEqual(storedValue);
    });

    it('returns the default value when the stored options are invalid', () => {
        const memento = mementoFactory();
        const invalidValue = 3;
        memento.get.mockReturnValue(invalidValue);
        const defaultValue = 'defaultValue';
        const store = new MementoStore(memento, 'key', defaultValue, z.string());

        const got = store.value;

        expect(got).toEqual(defaultValue);
    });

    it('updates the stored value when the field is set', () => {
        const memento = mementoFactory();
        const mementoKey = 'key';
        const store = new MementoStore(memento, mementoKey, 'defaultValue', z.string());
        const newValue = 'newValue';

        store.value = newValue;

        expect(memento.update).toHaveBeenCalledWith(mementoKey, newValue);
    });
});
