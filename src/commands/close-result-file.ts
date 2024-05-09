/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { ObservableCollection } from '../observable-collection';
import { SampleFile } from '../views/sampling-results/tree-data-provider';

export class CloseResultFile {
    constructor(private readonly files: ObservableCollection<SampleFile>) {}

    execute = (file: vscode.TreeItem) => {
        this.files.deleteFirst(item => item.uri === file.resourceUri);
    };
}
