/**
 * Copyright (C) 2024 Arm Limited
 */

import * as path from 'path';
import { promises as fs } from 'fs';

export const loadFixtureFile = async (pathInFixturesDir: string): Promise<string> => {
    return await fs.readFile(absoluteFixturePath(pathInFixturesDir), { encoding: 'ascii' });
};

export const absoluteFixturePath = (pathInFixturesDir: string): string => {
    return path.join(__dirname, pathInFixturesDir);
};
