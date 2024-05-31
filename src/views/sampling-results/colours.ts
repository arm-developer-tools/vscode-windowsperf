/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import * as d3 from 'd3';

export const textEditorColour = (overhead: number): string => {
    const colorScale = d3.scaleSequential([0, 100], d3.interpolateTurbo);
    return colorScale(overhead);
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
