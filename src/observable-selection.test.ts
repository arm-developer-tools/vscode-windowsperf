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

import { ObservableSelection } from './observable-selection';

type Days = 'Friday' | 'Saturday' | 'Sunday';

describe('ObservableSelection', () => {
    it('starts empty', () => {
        const day = new ObservableSelection<Days>();

        expect(day.selected).toBeNull();
    });

    it('can be seeded with values', () => {
        const day = new ObservableSelection<Days>('Friday');

        expect(day.selected).toEqual('Friday');
    });

    describe('selecting an item', () => {
        it('selects new item', async () => {
            const day = new ObservableSelection<Days>('Friday');

            day.selected = 'Sunday';

            expect(day.selected).toEqual('Sunday');
        });

        it('notifies listeners', () => {
            const day = new ObservableSelection<Days>('Friday');
            const listener = jest.fn();
            day.onDidChange(listener);

            day.selected = 'Sunday';

            const wantEvent = { item: 'Sunday', type: 'select' };
            expect(listener).toHaveBeenCalledWith(wantEvent);
        });
    });

    describe('clearing the selection', () => {
        it('notifies listeners', () => {
            const day = new ObservableSelection<Days>('Friday');
            const listener = jest.fn();
            day.onDidChange(listener);

            day.selected = null;

            const wantEvent = { type: 'clear' };
            expect(listener).toHaveBeenCalledWith(wantEvent);
        });
    });
});
