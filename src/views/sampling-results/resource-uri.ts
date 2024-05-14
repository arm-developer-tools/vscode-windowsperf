/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { SourceCode } from '../../wperf/parse';

const SCHEME = 'wperf-source-code';
const HITS_PARAM = 'wperf-hits';

export const buildSourceCodeUri = (sourceCode: SourceCode): vscode.Uri => {
    return vscode.Uri
        .file(sourceCode.filename)
        .with({
            scheme: SCHEME,
            query: `${HITS_PARAM}=${sourceCode.hits}`
        });
};

export const isSourceCodeUri = (uri: vscode.Uri): boolean => {
    return uri.scheme === SCHEME;
};

export const sourceCodeColor = (uri: vscode.Uri): vscode.ThemeColor | undefined  => {
    const numHits = howManyHits(uri);
    if (numHits === undefined) {
        return undefined;
    }
    // TODO: this number is meaningless, hits should be percentage, not absolute values
    if (numHits > 50) {
        return new vscode.ThemeColor('list.errorForeground');
    }
    if (numHits > 10) {
        return new vscode.ThemeColor('list.warningForeground');
    }
    return undefined;
};

const howManyHits = (uri: vscode.Uri): number | undefined => {
    const params = new URLSearchParams(uri.query);
    const hits = params.get(HITS_PARAM) || '';
    const numHits = parseInt(hits);
    return isNaN(numHits) ? undefined : numHits;
};
