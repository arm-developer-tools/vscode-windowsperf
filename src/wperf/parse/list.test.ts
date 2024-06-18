/**
 * Copyright (C) 2024 Arm Limited
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
