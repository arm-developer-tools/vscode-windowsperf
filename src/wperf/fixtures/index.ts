/**
 * Copyright (C) 2024 Arm Limited
 */

import * as path from 'path';
import { promises as fs } from 'fs';

export const loadFixtureFile = async (pathInFixturesDir: string): Promise<string> => {
    const fullPath = path.join(__dirname, pathInFixturesDir);
    return await fs.readFile(fullPath, { encoding: 'ascii' });
};
