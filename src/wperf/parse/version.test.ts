/**
 * Copyright (C) 2024 Arm Limited
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
