/**
 * Copyright (C) 2024 Arm Limited
 */


import { fileDecorationProvider } from './file-decoration-provider';
import { buildSourceCodeUri, sourceCodeColor } from './resource-uri';
import { sourceCodeFactory } from '../../wperf/parse.factories';
import { Uri } from 'vscode';

describe('fileDecorationProvider', () => {
    describe('provideFileDecoration', () => {
        it('colours source code uris', () => {
            const uri = buildSourceCodeUri(sourceCodeFactory());

            const got = fileDecorationProvider.provideFileDecoration(uri);

            const want = { color: sourceCodeColor(uri) };
            expect(got).toEqual(want);
        });

        it('does not affect other files', () => {
            const uri = Uri.parse('file://foo.txt');

            const got = fileDecorationProvider.provideFileDecoration(uri);

            expect(got).toEqual(undefined);
        });
    });
});
