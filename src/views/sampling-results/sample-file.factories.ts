/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { faker } from '@faker-js/faker';

import { sampleFactory } from '../../wperf/parse.factories';
import { SampleFile } from './sample-file';

export const sampleFileFactory = (options?: Partial<SampleFile>): SampleFile => {
    const uri = options?.uri ?? vscode.Uri.file(faker.system.filePath());
    const parsedContent = options?.parsedContent ?? sampleFactory();
    return new SampleFile(uri, parsedContent);
};
