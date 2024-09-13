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
import { parseVersionJson } from './version';
import { loadFixtureFile } from '../fixtures';
import { ValidationError } from './validation-error';

describe('Version', () => {
    it('parses minimal schema compliant json', () => {
        const versionData = {
            Component: 'mock-1',
            Version: 'mock-2',
        };
        const data = {
            Version: [versionData],
        };
        const json = JSON.stringify(data);

        const got = parseVersionJson(json);

        const want = [versionData];
        expect(got).toEqual(want);
    });

    it('parses wperf output json', async () => {
        const json = await loadFixtureFile('wperf-3.8.0.version.json');

        const got = parseVersionJson(json);

        expect(got).toHaveLength(2);
        expect(got[1]).toEqual({
            Component: 'wperf-driver',
            Version: '3.8.0',
        });
    });

    it('throws an error when json does not follow schema', () => {
        const json = '{}';

        expect(() => {
            parseVersionJson(json);
        }).toThrow(ValidationError);
    });

    it('returns an error when json is not valid', () => {
        expect(() => {
            parseVersionJson('##!@#!');
        }).toThrow();
    });
});
