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

import 'jest';
import { buildListCommand, buildRecordCommand, buildTestAsTextCommand } from './run';
import { buildRecordArgs } from './record-options';
import { faker } from '@faker-js/faker';
import { recordOptionsFactory } from './record-options.factories';

describe('buildRecordCommand', () => {
    it('escapes the executable and returns the correct arguments', () => {
        const executablePath = faker.system.filePath();
        const options = recordOptionsFactory();
        const forceLock = true;

        const got = buildRecordCommand(executablePath, options, forceLock);

        const want = `"${executablePath}" ${buildRecordArgs(options, forceLock)}`;
        expect(got).toEqual(want);
    });
});

describe('buildListCommand', () => {
    it('escapes the executable and returns the correct arguments', () => {
        const executablePath = faker.system.filePath();

        const got = buildListCommand(executablePath);

        expect(got).toEqual(`"${executablePath}" list -v --json`);
    });
});

describe('buildTestCommand', () => {
    it('escapes the executable and returns the correct arguments', () => {
        const executablePath = faker.system.filePath();

        const got = buildTestAsTextCommand(executablePath);

        expect(got).toEqual(`"${executablePath}" test`);
    });
});
