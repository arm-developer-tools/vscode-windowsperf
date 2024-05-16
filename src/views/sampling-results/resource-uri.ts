/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { treeViewColour } from './colours';
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
    return treeViewColour(numHits);
};

const howManyHits = (uri: vscode.Uri): number | undefined => {
    const params = new URLSearchParams(uri.query);
    const hits = params.get(HITS_PARAM) || '';
    const numHits = parseInt(hits);
    return isNaN(numHits) ? undefined : numHits;
};
