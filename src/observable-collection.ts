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
}
