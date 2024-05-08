/**
 * Copyright (C) 2024 Arm Limited
 */

import { ObservableCollection } from './observable-collection';

describe('ObservableCollection', () => {
    it('starts empty', () => {
        const numbers = new ObservableCollection();

        expect(numbers.items).toEqual([]);
    });

    it('can be seeded with values', () => {
        const numbers = new ObservableCollection([1,2,3]);

        expect(numbers.items).toEqual([1,2,3]);
    });

    it('prevents collection mutations', () => {
        const numbers = new ObservableCollection([1,2,3]);

        numbers.items.push(4);

        expect(numbers.items).toEqual([1,2,3]);
    });

    describe('add', () => {
        it('adds items to the collection', async () => {
            const numbers = new ObservableCollection<number>();

            numbers.add(1);

            expect(numbers.items).toEqual([1]);
        });

        it('notifies listeners when items are added', () => {
            const numbers = new ObservableCollection<number>();
            const listener = jest.fn();

            numbers.onDidChange(listener);
            numbers.add(9);

            const wantEvent = { item: 9, type: 'add' };
            expect(listener).toHaveBeenCalledWith(wantEvent);
        });
    });

    describe('deleteFirst', () => {
        it('removes first item matching the predicate', async () => {
            const numbers = new ObservableCollection<number>([1,2,3]);

            numbers.deleteFirst(number => number > 1);

            expect(numbers.items).toEqual([1,3]);
        });

        it('notifies about the removal', () => {
            const numbers = new ObservableCollection<number>([1,2,3]);
            const listener = jest.fn();

            numbers.onDidChange(listener);
            numbers.deleteFirst(number => number === 3);

            const wantEvent = { item: 3, type: 'delete' };
            expect(listener).toHaveBeenCalledWith(wantEvent);
        });
    });
});
