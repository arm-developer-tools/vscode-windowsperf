/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { faker } from '@faker-js/faker';

import { SampleFile } from './tree-data-provider';
import { sampleFactory } from '../../wperf/projected-types.factories';

export const sampleFileFactory = (options?: Partial<SampleFile>): SampleFile => ({
    uri: options?.uri ?? vscode.Uri.file(faker.system.filePath()),
    parsedContent: options?.parsedContent ?? sampleFactory(),
});
