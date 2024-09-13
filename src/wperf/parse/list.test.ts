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
import { parseListJson } from './list';
import { loadFixtureFile } from '../fixtures';
import { ValidationError } from './validation-error';

describe('parseListJson', () => {
    it('parses minimal schema compliant json', () => {
        const data = {
            Predefined_Events: [
                {
                    Alias_Name: 'alias-1',
                    Event_Type: 'type-1',
                    Raw_Index: 'index-1',
                    Description: 'desc-1',
                },
                {
                    Alias_Name: 'alias-2',
                    Event_Type: 'type-2',
                    Raw_Index: 'index-2',
                    Description: 'desc-2',
                },
            ],
            Predefined_Metrics: [{ Events: 'events-1', Metric: 'metric-1' }],
            Predefined_Groups_of_Metrics: [],
        };
        const json = JSON.stringify(data);

        const got = parseListJson(json);

        const want = [
            { Alias_Name: 'alias-1', Description: 'desc-1' },
            { Alias_Name: 'alias-2', Description: 'desc-2' },
        ];
        expect(got).toEqual(want);
    });

    it('parses wperf output json', async () => {
        const json = await loadFixtureFile('wperf-3.5.0.list.json');

        const got = parseListJson(json);

        expect(got).toHaveLength(463);
        expect(got[1]).toEqual({
            Alias_Name: 'l1i_cache_refill',
            Description: 'level 1 instruction cache refill',
        });
    });

    it('throws an error when json does not follow schema', () => {
        const json = '{}';

        expect(() => {
            parseListJson(json);
        }).toThrow(ValidationError);
    });

    it('returns an error when json is not valid', () => {
        expect(() => {
            parseListJson('##!@#!');
        }).toThrow();
    });
});
