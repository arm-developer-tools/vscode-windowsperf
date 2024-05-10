/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { it } from '@jest/globals';

import { buildSourceCodeUri, isSourceCodeUri, sourceCodeColor } from './resource-uri';
import { sourceCodeFactory } from '../../wperf/projected-types.factories';

describe('buildSourceCodeUri', () => {
    it('returns source-code://<file name> uri', () => {
        const sourceCode = sourceCodeFactory({ filename: 'some-file.c' });

        const got = buildSourceCodeUri(sourceCode);

        expect(got.scheme).toEqual('wperf-source-code');
        expect(got.path).toEqual('/some-file.c');
    });

    it('embeds hits in query parameters', () => {
        const sourceCode = sourceCodeFactory({ hits: 999 });

        const got = buildSourceCodeUri(sourceCode);

        const params = new URLSearchParams(got.query);
        expect(params.get('wperf-hits')).toEqual('999');
    });
});

describe('isSourceCodeUri', () => {
    it('returns true for source code uris', () => {
        const uri = buildSourceCodeUri(sourceCodeFactory());

        const got = isSourceCodeUri(uri);

        expect(got).toBe(true);
    });

    it('returns false for non source code uris', () => {
        const uri = vscode.Uri.parse('file://foo.txt');

        const got = isSourceCodeUri(uri);

        expect(got).toBe(false);
    });
});

describe('sourceCodeColor', () => {
    it.each(
        [
            { hits: 51, wantColor: new vscode.ThemeColor('list.errorForeground') },
            { hits: 11, wantColor: new vscode.ThemeColor('list.warningForeground') },
            { hits: 10, wantColor: undefined },
        ],
    )('colors based on number of hits', ({ hits, wantColor }) => {
        const uri = buildSourceCodeUri(sourceCodeFactory({ hits }));

        const got = sourceCodeColor(uri);

        expect(got).toEqual(wantColor);
    });
});
