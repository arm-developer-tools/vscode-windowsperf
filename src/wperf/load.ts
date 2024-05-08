/**
 * Copyright (C) 2024 Arm Limited
 */

import { promises as fs } from 'fs';

import { parseSampleJson } from './parse';
import { Sample } from './schemas/out/sample';

export const loadSampleFile = async (fullPath: string): Promise<Sample> => {
    const fileContents = await fs.readFile(fullPath, { encoding: 'ascii' });
    return parseSampleJson(fileContents);
};
