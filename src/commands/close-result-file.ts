/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { ObservableCollection } from '../observable-collection';
import { SampleFile } from '../views/sampling-results/sample-file';
import { ObservableSelection } from '../observable-selection';

export class CloseResultFile {
    constructor(
        private readonly collection: ObservableCollection<SampleFile>,
        private readonly selection: ObservableSelection<SampleFile>,
    ) {}

    execute = (file: vscode.TreeItem) => {
        this.collection.deleteFirst(item => item.uri === file.resourceUri);
        if (this.selection.selected?.uri === file.resourceUri) {
            this.selection.selected = null;
        }
    };
}
