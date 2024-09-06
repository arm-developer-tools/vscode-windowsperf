/**
 * Copyright (C) 2024 Arm Limited
 */

import path from 'path';

import { checkHasFileAccess, checkFileExistsOnPath, isSamePath } from './path';
import { Uri } from 'vscode';

describe('isSamePath', () => {
    it('returns true if the inputs are identical', () => {
        const got = isSamePath(__dirname, __dirname);

        expect(got).toBe(true);
    });

    it('returns true if the inputs resolve to the same path', () => {
        // E.g. /path/to/src/../src
        const input = `${__dirname}${path.sep}..${path.sep}${path.basename(__dirname)}`;

        const got = isSamePath(__dirname, input);

        expect(got).toBe(true);
    });

    it('returns true if one input is the URI.fsPath of the other', () => {
        // On Windows, the drive letter will be capitalised on Windows for the first but not the second input
        const got = isSamePath(__dirname, Uri.file(__dirname).fsPath);

        expect(got).toBe(true);
    });

    it('returns false if the inputs do not resolve to the same path', () => {
        const got = isSamePath(__dirname, path.resolve(__dirname, '..'));

        expect(got).toBe(false);
    });
});

describe('checkHasFileAccess', () => {
    it('returns true if is a valid filepath', async () => {
        const got = await checkHasFileAccess(__filename);

        expect(got).toBe(true);
    });

    it('returns false if the is NOT a filepath', async () => {
        const got = await checkHasFileAccess('/example/wrong/filepath.ts');

        expect(got).toBe(false);
    });
});

describe('checkFileExistsOnPath', () => {
    it('returns false if process path is undefined', async () => {
        const got = await checkFileExistsOnPath(undefined, 'mock-filename.ts');

        expect(got).toBe(false);
    });

    it('returns true if file exits on path', async () => {
        const got = await checkFileExistsOnPath(__dirname, path.basename(__filename));

        expect(got).toBe(true);
    });

    it('returns false if file not found on path', async () => {
        const got = await checkFileExistsOnPath(__dirname, 'mock-wrong-filename.ts');

        expect(got).toBe(false);
    });
});
