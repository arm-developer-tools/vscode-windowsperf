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

import { ObservableCollection } from './observable-collection';

describe('ObservableCollection', () => {
    it('starts empty', () => {
        const numbers = new ObservableCollection();

        expect(numbers.items).toEqual([]);
    });

    it('can be seeded with values', () => {
        const numbers = new ObservableCollection([1, 2, 3]);

        expect(numbers.items).toEqual([1, 2, 3]);
    });

    it('prevents collection mutations', () => {
        const numbers = new ObservableCollection([1, 2, 3]);

        numbers.items.push(4);

        expect(numbers.items).toEqual([1, 2, 3]);
    });

    describe('prepend', () => {
        it('adds items to the start of the collection', async () => {
            const numbers = new ObservableCollection<number>([2]);

            numbers.prepend(1);

            expect(numbers.items).toEqual([1, 2]);
        });

        it('notifies listeners when items are added', () => {
            const numbers = new ObservableCollection<number>();
            const listener = jest.fn();

            numbers.onDidChange(listener);
            numbers.prepend(9);

            const wantEvent = { item: 9, type: 'add' };
            expect(listener).toHaveBeenCalledWith(wantEvent);
        });
    });

    describe('deleteFirst', () => {
        it('removes first item matching the predicate', async () => {
            const numbers = new ObservableCollection<number>([1, 2, 3]);

            numbers.deleteFirst((number) => number > 1);

            expect(numbers.items).toEqual([1, 3]);
        });

        it('notifies about the removal', () => {
            const numbers = new ObservableCollection<number>([1, 2, 3]);
            const listener = jest.fn();

            numbers.onDidChange(listener);
            numbers.deleteFirst((number) => number === 3);

            const wantEvent = { item: 3, type: 'delete' };
            expect(listener).toHaveBeenCalledWith(wantEvent);
        });
    });

    describe('deleteAll', () => {
        it('removes all items', () => {
            const numbers = new ObservableCollection<number>([1, 2, 3]);

            numbers.deleteAll();

            expect(numbers.items).toEqual([]);
        });
    });
});
