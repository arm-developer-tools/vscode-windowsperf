/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import {
    RecordJsonOutput,
    getEventsWithUnknownSymbol,
    parseRecordJson,
    parseSample,
} from './record';
import { loadFixtureFile } from '../fixtures';
import { ValidationError } from './validation-error';
import { percentage } from '../../math';
import { eventFactory, eventSampleFactory } from './record.factories';

describe('parseRecordJSON', () => {
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

        const got = parseRecordJson(json);

        expect(got).toEqual([]);
    });

    it('parses wperf output json generated with the --disassemble option', async () => {
        const json = await loadFixtureFile('wperf-3.3.3.record.json');

        const got = parseRecordJson(json);

        expect(got.length).toBeGreaterThan(0);
    });

    it('parses wperf output json generated with the --annotate option but without the --disassemble option', async () => {
        const json = await loadFixtureFile('wperf-3.5.0.record-no-disassembly.json');

        const got = parseRecordJson(json);

        expect(got.length).toBeGreaterThan(0);
    });

    it('uses sample parser to pre-calculate additional fields', async () => {
        const json = await loadFixtureFile('wperf-3.3.3.record.json');

        const got = parseRecordJson(json);

        expect(got[0]!.annotate[0]!.source_code[0]!.overhead).not.toBeUndefined();
    });

    it('returns an error when json does not follow schema', () => {
        const json = '{}';

        expect(() => {
            parseRecordJson(json);
        }).toThrow(ValidationError);
    });

    it('returns an error when json is not valid', () => {
        expect(() => {
            parseRecordJson('##!@#!');
        }).toThrow();
    });
});

describe('parseSample', () => {
    it('decorates source code with overhead percentages', () => {
        const toParse = {
            sampling: {
                events: [
                    {
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
                        ],
                    },
                ],
            },
        } as RecordJsonOutput;

        const got = parseSample(toParse)[0]!.annotate;

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

describe('getEventsWithUnknownSymbol', () => {
    const unknownEventSample = eventSampleFactory({ symbol: 'unknown' });

    it('includes events which only have an unknown symbol', () => {
        const sample = [
            eventFactory({ type: 'add' }),
            eventFactory({ type: 'mult' }),
            eventFactory({ type: 'shift', samples: [unknownEventSample] }),
        ];

        expect(getEventsWithUnknownSymbol(sample)).toEqual(['shift']);
    });

    it('does not include events with both an unknown symbol and a known symbol', () => {
        const knownEventSample = eventSampleFactory({ symbol: 'lib.dll' });
        const sample = [
            eventFactory({ type: 'div' }),
            eventFactory({ type: 'interupt' }),
            eventFactory({ type: 'load', samples: [unknownEventSample, knownEventSample] }),
        ];

        expect(getEventsWithUnknownSymbol(sample)).toEqual([]);
    });
});
