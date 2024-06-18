/**
 * Copyright (C) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';

import { SampleFile } from './sample-file';
import { Uri } from 'vscode';
import { sampleFactory } from '../../wperf/parse/record.factories';

export const sampleFileFactory = (options?: Partial<SampleFile>): SampleFile => {
    const uri = options?.uri ?? Uri.file(faker.system.filePath());
    const parsedContent = options?.parsedContent ?? sampleFactory();
    return new SampleFile(uri, parsedContent);
};
