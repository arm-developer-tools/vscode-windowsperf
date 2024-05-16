/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';

export const textEditorColour = (numHits: number): string => {
    let colour: string;
    // TODO: this number is meaningless, hits should be percentage and colours would use spectrum
    if (numHits > 50) {
        colour = 'rgba(255, 0, 0, 0.2)';
    } else if (numHits > 10) {
        colour = 'rgba(255, 255, 0, 0.2)';
    } else {
        colour = 'rgba(100, 100, 100, 0.2)';
    }
    return colour;
};

export const treeViewColour = (numHits: number): vscode.ThemeColor | undefined => {
    let colour: vscode.ThemeColor | undefined;
    // TODO: this number is meaningless, hits should be percentage and colours would use spectrum
    if (numHits > 50) {
        colour = new vscode.ThemeColor('list.errorForeground');
    } else if (numHits > 10) {
        colour = new vscode.ThemeColor('list.warningForeground');
    }
    return colour;
};
