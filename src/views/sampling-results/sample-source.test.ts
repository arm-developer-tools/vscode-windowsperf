/*
 * Copyright (c) 2024 Arm Limited
 */

import { recordRunFactory } from './record-run.factories';
import { sampleFileFactory } from './sample-file.factories';
import { SampleSource, isSourceSampleFile } from './sample-source';
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

        it('returns false when type is Not file', () => {
            const sourceRun = sampleSourceRunFactory().context;
            const got = isSourceSampleFile(sourceRun);

            expect(got).toEqual(false);
        });
    });
});
