/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import path from 'path';

import { isSamePath } from './path';

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
        const got = isSamePath(__dirname, vscode.Uri.file(__dirname).fsPath);

        expect(got).toBe(true);
    });

    it('returns false if the inputs do not resolve to the same path', () => {
        const got = isSamePath(__dirname, path.resolve(__dirname, '..'));

        expect(got).toBe(false);
    });
});
