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

import { recordRunFactory } from './record-run.factories';
import { sampleFileFactory } from './sample-file.factories';
import { SampleSource, isSourceRecordRun, isSourceSampleFile } from './sample-source';
import { sampleSourceFileFactory, sampleSourceRunFactory } from './sample-source.factories';

describe('SampleSource', () => {
    describe('fromSampleFile', () => {
        it('returns a new instance when provided with a sample file', () => {
            const sampleFile = sampleFileFactory();

            const got = SampleSource.fromSampleFile(sampleFile);

            expect(got.context.result).toEqual(sampleFile);
            expect(got.context.type).toBe('file');
        });
    });

    describe('fromRecordRun', () => {
        it('returns a new instance when provided with a sample record command', () => {
            const record = recordRunFactory();

            const got = SampleSource.fromRecordRun(record);

            expect(got.context.result).toEqual(record);
            expect(got.context.type).toBe('run');
        });
    });

    describe('id', () => {
        it('returns a valid uuid', () => {
            const run1 = sampleSourceFileFactory();
            const run2 = sampleSourceRunFactory();

            expect(run1.id).not.toBeUndefined();
            expect(run2.id).not.toBeUndefined();
            expect(run1.id).not.toEqual(run2.id);
        });
    });

    describe('isSourceSampleFile', () => {
        it('returns true when type is file', () => {
            const sourceFile = sampleSourceFileFactory().context;
            const got = isSourceSampleFile(sourceFile);

            expect(got).toEqual(true);
        });

        it('returns false when type is not file', () => {
            const sourceRun = sampleSourceRunFactory().context;
            const got = isSourceSampleFile(sourceRun);

            expect(got).toEqual(false);
        });
    });

    describe('isSourceRecordRun', () => {
        it('returns true when type is run', () => {
            const sourceRun = sampleSourceRunFactory().context;
            const got = isSourceRecordRun(sourceRun);

            expect(got).toEqual(true);
        });

        it('returns false when type is not run', () => {
            const sourceFile = sampleSourceFileFactory().context;
            const got = isSourceRecordRun(sourceFile);

            expect(got).toEqual(false);
        });
    });
});
