/**
 * Copyright (C) 2024 Arm Limited
 */

import { promises as fs } from 'fs';
import { Sample, parseRecordJson } from './parse/record';

export const loadSampleFile = async (fullPath: string): Promise<Sample> => {
    const fileContents = await fs.readFile(fullPath, { encoding: 'ascii' });
    return parseRecordJson(fileContents);
};
