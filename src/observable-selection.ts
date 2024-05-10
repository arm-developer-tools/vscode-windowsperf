/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

type MutationEvent<T> =
    | { type: 'select', item: T }
    | { type: 'clear' };


export type Selection<T> = T | null;

export class ObservableSelection<T> {
    private _selected: Selection<T> = null;
    private readonly _onDidChange = new vscode.EventEmitter<MutationEvent<T>>();
    readonly onDidChange = this._onDidChange.event;

    constructor(initialSelection: Selection<T> = null) {
        this._selected = initialSelection;
    }

    get selected(): Selection<T> {
        return this._selected;
    }

    set selected(item: Selection<T>) {
        this._selected = item;
        this._onDidChange.fire(
            item === null
                ? { type: 'clear' }
                : { type: 'select', item }
        );
    }
}
