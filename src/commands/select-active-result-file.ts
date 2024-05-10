/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { SampleFile } from '../views/sampling-results/sample-file';

export class SelectActiveResultFile {
    constructor(
        private readonly collection: ObservableCollection<SampleFile>,
        private readonly selection: ObservableSelection<SampleFile>,
    ) {}

    execute = async (file: vscode.TreeItem) => {
        for (const item of this.collection.items) {
            if (item.uri === file.resourceUri) {
                this.selection.selected = item;
                return;
            }
        }
    };
}
