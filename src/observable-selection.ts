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

type MutationEvent<T> = { type: 'select'; item: T } | { type: 'clear' };

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
        this._onDidChange.fire(item === null ? { type: 'clear' } : { type: 'select', item });
    }
}
