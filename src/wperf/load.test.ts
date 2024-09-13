/**
 * Copyright 2024 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { faker } from '@faker-js/faker';

import { loadSampleFile } from './load';
import { parseRecordJson } from './parse/record';

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

        expect(got).toEqual(parseRecordJson(json));
    });
});

const createTempFile = async (contents: string): Promise<string> => {
    const fileName = faker.system.fileName();
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'loadTest-'));
    const fullPath = path.join(dir, fileName);
    await fs.writeFile(fullPath, contents);
    return fullPath;
};
