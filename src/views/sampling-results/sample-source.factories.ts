/*
 * Copyright (c) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';
import { recordRunFactory } from './record-run.factories';
import { sampleFileFactory } from './sample-file.factories';
import { SampleSource, Source, SourceRecordRun, SourceSampleFile } from './sample-source';

export const sampleSourceFileFactory = (options?: Partial<SourceSampleFile>): SampleSource => {
    return SampleSource.fromSampleFile(options?.result ?? sampleFileFactory());
};

export const sampleSourceRunFactory = (options?: Partial<SourceRecordRun>): SampleSource => {
    return SampleSource.fromRecordRun(options?.result ?? recordRunFactory());
};

export const sampleSourceFactory = (options?: Source): SampleSource => {
    if (options) {
        return new SampleSource(options);
    }
    const randomFactory = faker.helpers.arrayElement([
        sampleSourceFileFactory,
        sampleSourceRunFactory,
    ]);
    return randomFactory();
};
