/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { isSourceCodeUri, sourceCodeColor } from './resource-uri';

export const fileDecorationProvider = {
    provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration> {
        if (isSourceCodeUri(uri)) { // Ensure we don't affect every file
            return {
                color: sourceCodeColor(uri),
            };
        }
        return undefined;
    }
};
