/**
 * Copyright (C) 2024 Arm Limited
 */

import { SampleFile } from './sample-file';
import { sampleFactory } from '../../wperf/parse.factories';
import path from 'path';
import { Uri } from 'vscode';

describe('SampleFile', () => {
    describe('fromUri', () => {
        it('returns a new instance when provided with a loadable file uri', async () => {
            const uri = Uri.file('some-file.json');
            const loadSampleFile = jest.fn().mockReturnValue(sampleFactory());

            const got = await SampleFile.fromUri(uri, loadSampleFile);

            expect(got.uri).toEqual(uri);
            expect(got.parsedContent).toEqual(await loadSampleFile(uri.fsPath));
            expect(loadSampleFile).toHaveBeenCalledWith(uri.fsPath);
        });

        it('errors when unable to load file', () => {
            const uri = Uri.file('some-file.json');
            const error = new Error('boom!');
            const loadSampleFile = jest.fn().mockRejectedValue(error);

            expect(
                SampleFile.fromUri(uri, loadSampleFile)
            ).rejects.toThrow(error);
        });
    });

    describe('id', () => {
        it('returns a uuid', () => {
            const uri = Uri.file('foo-bar.c');
            const file1 = new SampleFile(uri, sampleFactory());
            const file2 = new SampleFile(uri, sampleFactory());

            expect(file1.id).not.toBeUndefined();
            expect(file2.id).not.toBeUndefined();
            expect(file1.id).not.toEqual(file2.id);
        });
    });

    describe('displayName', () => {
        it('returns base name of the file path', () => {
            const uri = Uri.file(path.join('foo', 'bar', 'baz.json'));
            const sampleFile = new SampleFile(uri, sampleFactory());

            expect(sampleFile.displayName).toEqual('baz.json');
        });
    });
});