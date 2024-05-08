/**
 * Copyright (C) 2024 Arm Limited
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { faker } from '@faker-js/faker';

import { loadSampleFile } from './load';

describe('loadSampleFile', () => {
    it('loads sample file from the filesystem', async () => {
        const data = {
            sampling: {
                sample_display_row: 10,
                samples_generated: 1337,
                samples_dropped: 10,
                pe_file: 'some-pe-file',
                pdb_file: 'some-pdb-file',
                events: [],
            },
        };
        const json = JSON.stringify(data);
        const filePath = await createTempFile(json);

        const got = await loadSampleFile(filePath);

        expect(got).toEqual(data);
    });
});

const createTempFile = async (contents: string): Promise<string> => {
    const fileName = faker.system.fileName();
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'loadTest-'));
    const fullPath = path.join(dir, fileName);
    await fs.writeFile(fullPath, contents);
    return fullPath;
};
