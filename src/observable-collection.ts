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

import * as vscode from 'vscode';

type MutationEvent<T> = {
    type: 'add' | 'delete';
    item: T;
};

export class ObservableCollection<T> {
    private readonly _items: T[] = [];
    private readonly _onDidChange = new vscode.EventEmitter<MutationEvent<T>>();
    readonly onDidChange = this._onDidChange.event;

    constructor(initialItems?: T[]) {
        if (initialItems !== undefined) {
            this._items = [...initialItems];
        }
    }

    get items(): T[] {
        return [...this._items];
    }

    prepend(item: T) {
        this._items.unshift(item);
        this._onDidChange.fire({ item, type: 'add' });
    }

    deleteFirst(predicate: (item: T) => boolean) {
        const index = this._items.findIndex(predicate);
        if (index !== -1) {
            return this.deleteAtIndex(index);
        }
    }

    deleteAtIndex(index: number) {
        const deleted = this._items.splice(index, 1)[0];
        if (deleted) {
            this._onDidChange.fire({ item: deleted, type: 'delete' });
        }
    }

    deleteAll() {
        this._items.splice(0, this.items.length);
    }
}
