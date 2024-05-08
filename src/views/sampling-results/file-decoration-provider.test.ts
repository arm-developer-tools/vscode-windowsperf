/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { fileDecorationProvider } from './file-decoration-provider';
import { buildSourceCodeUri, sourceCodeColor } from './resource-uri';
import { sourceCodeFactory } from '../../wperf/projected-types.factories';

describe('fileDecorationProvider', () => {
    describe('provideFileDecoration', () => {
        it('colours source code uris', () => {
            const uri = buildSourceCodeUri(sourceCodeFactory());

            const got = fileDecorationProvider.provideFileDecoration(uri);

            const want = { color: sourceCodeColor(uri) };
            expect(got).toEqual(want);
        });

        it('does not affect other files', () => {
            const uri = vscode.Uri.parse('file://foo.txt');

            const got = fileDecorationProvider.provideFileDecoration(uri);

            expect(got).toEqual(undefined);
        });
    });
});
