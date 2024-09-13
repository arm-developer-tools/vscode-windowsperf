/**
 * Copyright 2024 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import path from 'path';

import {
    checkHasFileAccess,
    checkFileExistsOnPath,
    isSamePath,
    checkWperfExistsInSettingsOrPath,
    checkFileExistsOnPathOnWindowsOnly,
} from './path';
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

describe('checkFileExistsOnPathOnWindowsOnly', () => {
    it("returns false if the platform isn't windows", async () => {
        const platform = 'linux';
        expect(
            await checkFileExistsOnPathOnWindowsOnly(
                platform,
                __dirname,
                path.basename(__filename),
            ),
        ).toBe(false);
    });
});

describe('checkWperfExistsInSettingsOrPath', () => {
    it('returns true when there is no wperfPath setting and "wperf" is on the PATH', async () => {
        const getExecutable = jest.fn().mockReturnValue('wperf');
        const checkPath = jest.fn().mockResolvedValue(true);

        expect(await checkWperfExistsInSettingsOrPath(getExecutable, checkPath)).toBe(true);
    });

    it('returns true when the wperfPath setting includes "wperf.exe"', async () => {
        const getExecutable = jest.fn().mockReturnValue('C:\\the\\file\\path\\to\\wperf.exe');

        expect(await checkWperfExistsInSettingsOrPath(getExecutable)).toBe(true);
    });
});
