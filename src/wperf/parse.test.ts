/**
 * Copyright (C) 2024 Arm Limited
 */

import { percentage } from '../math';
import { loadFixtureFile } from './fixtures';
import { SchemaValidationError, parseSample, parseSampleJson } from './parse';
import { Sample as SchemaSample } from './schemas/out/sample';

describe('parseSampleJSON', () => {
    it('parses minimal schema compliant json', () => {
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
    });

    it('uses sample parser to pre-calculate additional fields', async () => {
        const json = await loadFixtureFile('wperf-3.3.3.record.json');

        const got = parseSampleJson(json);

        expect(got.sampling.events[0].annotate[0].source_code[0].overhead).not.toBeUndefined();
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

describe('parseSample', () => {
    it('decorates source code with overhead percentages', () => {
        const toParse = {
            sampling: {
                events: [{
                    annotate: [
                        {
                            function_name: 'add',
                            source_code: [
                                { filename: 'file-1.c', hits: 53 },
                                { filename: 'file-2.c', hits: 31 },
                            ],
                        },
                        {
                            function_name: 'multiply',
                            source_code: [
                                { filename: 'file-a.c', hits: 3 },
                                { filename: 'file-b.c', hits: 5 },
                                { filename: 'file-c.c', hits: 2 },
                            ],
                        },
                    ]
                }],
            }
        } as unknown as SchemaSample;

        const got = parseSample(toParse).sampling.events[0].annotate;

        const wantAnnote = [
            {
                function_name: 'add',
                source_code: [
                    { filename: 'file-1.c', hits: 53, overhead: percentage(53, 53 + 31) },
                    { filename: 'file-2.c', hits: 31, overhead: percentage(31, 53 + 31) },
                ],
            },
            {
                function_name: 'multiply',
                source_code: [
                    { filename: 'file-a.c', hits: 3, overhead: percentage(3, 3 + 5 + 2) },
                    { filename: 'file-b.c', hits: 5, overhead: percentage(5, 3 + 5 + 2) },
                    { filename: 'file-c.c', hits: 2, overhead: percentage(2, 3 + 5 + 2) },
                ],
            },
        ];
        expect(wantAnnote).toEqual(got);
    });
});
