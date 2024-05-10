/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

type MutationEvent<T> = {
    type: 'add' | 'delete',
    item: T
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

    add(item: T) {
        this._items.push(item);
        this._onDidChange.fire({ item, type: 'add' });
    }

    deleteFirst(predicate: (item: T) => boolean) {
        for (let i = 0; i < this._items.length; i++) {
            if (predicate(this._items[i])) {
                return this.deleteAtIndex(i);
            }
        }
    }

    deleteAtIndex(index: number) {
        const deleted = this._items.splice(index, 1);
        this._onDidChange.fire({ item: deleted[0], type: 'delete' });
    }
}
