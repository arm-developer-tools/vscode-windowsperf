/**
 * Copyright (C) 2024 Arm Limited
 */

import { ObservableSelection } from './observable-selection';

type days = 'Friday' | 'Saturday' | 'Sunday';

describe('ObservableSelection', () => {
    it('starts empty', () => {
        const day = new ObservableSelection<days>();

        expect(day.selected).toBeNull();
    });

    it('can be seeded with values', () => {
        const day = new ObservableSelection<days>('Friday');

        expect(day.selected).toEqual('Friday');
    });

    describe('selecting an item', () => {
        it('selects new item', async () => {
            const day = new ObservableSelection<days>('Friday');

            day.selected = 'Sunday';

            expect(day.selected).toEqual('Sunday');
        });

        it('notifies listeners', () => {
            const day = new ObservableSelection<days>('Friday');
            const listener = jest.fn();
            day.onDidChange(listener);

            day.selected = 'Sunday';

            const wantEvent = { item: 'Sunday', type: 'select' };
            expect(listener).toHaveBeenCalledWith(wantEvent);
        });
    });

    describe('clearing the selection', () => {
        it('notifies listeners', () => {
            const day = new ObservableSelection<days>('Friday');
            const listener = jest.fn();
            day.onDidChange(listener);

            day.selected = null;

            const wantEvent = { type: 'clear' };
            expect(listener).toHaveBeenCalledWith(wantEvent);
        });
    });
});

