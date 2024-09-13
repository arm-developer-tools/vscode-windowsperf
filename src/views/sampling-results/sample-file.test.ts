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

import { SampleFile } from './sample-file';
import path from 'path';
import { Uri } from 'vscode';
import { sampleFactory } from '../../wperf/parse/record.factories';

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

            expect(SampleFile.fromUri(uri, loadSampleFile)).rejects.toThrow(error);
        });
    });

    describe('displayName', () => {
        it('returns base name of the file path', () => {
            const uri = Uri.file(path.join('foo', 'bar', 'baz.json'));
            const sampleFile = new SampleFile(uri, sampleFactory());

            expect(sampleFile.displayName).toEqual('baz.json');
        });
    });

    describe('displayLog', () => {
        it('returns path of the file path', () => {
            const uri = Uri.file(path.join('foo', 'bar', 'baz.json'));
            const sampleFile = new SampleFile(uri, sampleFactory());

            expect(sampleFile.displayLog).toEqual(uri.toString());
        });
    });
});
