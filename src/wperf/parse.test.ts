/**
 * Copyright (C) 2024 Arm Limited
 */

import { loadFixtureFile } from './fixtures';
import { SchemaValidationError, parseSampleJson } from './parse';

describe('parseSampleJSON', () => {
    it('parses minimal valid sample json', () => {
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

        const got = parseSampleJson(json);

        expect(got).toEqual(data);
    });

    it('parses wperf output json', async () => {
        const json = await loadFixtureFile('wperf-3.3.3.record.json');

        const got = parseSampleJson(json);

        expect(got.sampling.events.length).toBeGreaterThan(0);
        expect(got.sampling.samples_generated).toEqual(774);
    });

    it('returns an error when json does not follow schema', () => {
        const json = '{}';

        expect(
            () => { parseSampleJson(json); }
        ).toThrow(SchemaValidationError);
    });

    it('returns an error when json is not valid', () => {
        expect(
            () => { parseSampleJson('##!@#!'); }
        ).toThrow();
    });
});
