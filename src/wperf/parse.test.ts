/**
 * Copyright (C) 2024 Arm Limited
 */

import { DefinedError } from 'ajv';
import { percentage } from '../math';
import { loadFixtureFile } from './fixtures';
import {
    ListOutput,
    SchemaValidationError,
    getEventNames,
    parseList,
    parseListJson,
    parseSample,
    parseSampleJson,
} from './parse';
import { Sample as SchemaSample } from './schemas/out/sample';
import { List as SchemaList } from './schemas/out/list';

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

        expect(got.sampling.events[0]!.annotate[0]!.source_code[0]!.overhead).not.toBeUndefined();
    });

    it('returns an error when json does not follow schema', () => {
        const json = '{}';

        expect(() => {
            parseSampleJson(json);
        }).toThrow(SchemaValidationError);
    });

    it('returns an error when json is not valid', () => {
        expect(() => {
            parseSampleJson('##!@#!');
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
        } as unknown as SchemaSample;

        const got = parseSample(toParse).sampling.events[0]!.annotate;

        const wantAnnote = [
            {
                function_name: 'add',
                source_code: [
                    {
                        filename: 'file-1.c',
                        hits: 53,
                        overhead: percentage(53, 53 + 31),
                    },
                    {
                        filename: 'file-2.c',
                        hits: 31,
                        overhead: percentage(31, 53 + 31),
                    },
                ],
            },
            {
                function_name: 'multiply',
                source_code: [
                    {
                        filename: 'file-a.c',
                        hits: 3,
                        overhead: percentage(3, 3 + 5 + 2),
                    },
                    {
                        filename: 'file-b.c',
                        hits: 5,
                        overhead: percentage(5, 3 + 5 + 2),
                    },
                    {
                        filename: 'file-c.c',
                        hits: 2,
                        overhead: percentage(2, 3 + 5 + 2),
                    },
                ],
            },
        ];
        expect(wantAnnote).toEqual(got);
    });
});

describe('parseListJson', () => {
    it('parses minimal schema compliant json', () => {
        const data: SchemaList = {
            Predefined_Events: [
                {
                    Alias_Name: 'alias-1',
                    Event_Type: 'type-1',
                    Raw_Index: 'index-1',
                },
                {
                    Alias_Name: 'alias-2',
                    Event_Type: 'type-2',
                    Raw_Index: 'index-2',
                },
            ],
            Predefined_Metrics: [{ Events: 'events-1', Metric: 'metric-1' }],
            Predefined_Groups_of_Metrics: [],
        };
        const json = JSON.stringify(data);

        const got = parseListJson(json);

        expect(got).toEqual(data);
    });

    it('parses wperf output json', async () => {
        const json = await loadFixtureFile('wperf-3.5.0.list.json');

        const got = parseListJson(json);

        expect(got.Predefined_Events).toHaveLength(463);
        expect(got.Predefined_Metrics).toHaveLength(5);
        expect(got.Predefined_Groups_of_Metrics).toHaveLength(0);

        expect(got.Predefined_Events[1]).toEqual({
            Alias_Name: 'l1i_cache_refill',
            Raw_Index: '0x0001',
            Event_Type: '[core PMU event]',
        });
    });

    it('returns an error when json does not follow schema', () => {
        const json = '{}';

        expect(() => {
            parseListJson(json);
        }).toThrow(SchemaValidationError);
    });

    it('returns an error when json is not valid', () => {
        expect(() => {
            parseListJson('##!@#!');
        }).toThrow();
    });
});

describe('parseList', () => {
    it('returns events, metrics and groups without modification if present in the input', () => {
        const toParse: SchemaList = {
            Predefined_Events: [
                {
                    Alias_Name: 'alias-1',
                    Event_Type: 'type-1',
                    Raw_Index: 'index-1',
                },
                {
                    Alias_Name: 'alias-2',
                    Event_Type: 'type-2',
                    Raw_Index: 'index-2',
                },
            ],
            Predefined_Metrics: [
                { Events: 'events-1', Metric: 'metric-1' },
                { Events: 'events-2', Metric: 'metric-2' },
            ],
            Predefined_Groups_of_Metrics: [
                { Group: 'group-1', Metrics: 'metric-1' },
                { Group: 'group-2', Metrics: 'metric-2' },
            ],
        };

        const output = parseList(toParse);

        expect(output).toEqual(toParse);
    });

    it('returns an empty list of groups when not present', () => {
        const toParse: SchemaList = {
            Predefined_Events: [
                {
                    Alias_Name: 'alias-1',
                    Event_Type: 'type-1',
                    Raw_Index: 'index-1',
                },
            ],
            Predefined_Metrics: [{ Events: 'events-1', Metric: 'metric-1' }],
        };

        const output = parseList(toParse);

        const want = { ...toParse, Predefined_Groups_of_Metrics: [] };
        expect(output).toEqual(want);
    });
});

describe('SchemaValidationError', () => {
    it('returns a message with all errors getDisplayMessage', () => {
        const validationError1: DefinedError = {
            instancePath: '/sampling/events/0/samples/0',
            schemaPath:
                '#/properties/sampling/properties/events/items/properties/samples/items/required',
            keyword: 'required',
            params: { missingProperty: 'overhead' },
            message: 'must have required property "overhead"',
        };

        const validationError2: DefinedError = {
            instancePath: '/sampling/events/0/samples/1',
            schemaPath:
                '#/properties/sampling/properties/events/items/properties/samples/items/required',
            keyword: 'required',
            params: { missingProperty: 'overhead' },
            message: 'must have required property "length"',
        };

        const error = new SchemaValidationError([validationError1, validationError2]);

        const wantedValidationMessage1 = `${validationError1.instancePath}: ${validationError1.message}`;
        const wantedValidationMessage2 = `${validationError2.instancePath}: ${validationError2.message}`;
        const wantedMessage = `Parsed json does not match the schema\n    ${wantedValidationMessage1}\n    ${wantedValidationMessage2}`;
        expect(error.getDisplayMessage()).toEqual(wantedMessage);
    });
});

describe('getEventNames', () => {
    it('returns the event names from a list of events', () => {
        const listOutput: ListOutput = {
            Predefined_Events: [
                {
                    Alias_Name: 'alias-1',
                    Event_Type: 'type-1',
                    Raw_Index: 'index-1',
                },
                {
                    Alias_Name: 'alias-2',
                    Event_Type: 'type-2',
                    Raw_Index: 'index-2',
                },
            ],
            Predefined_Metrics: [],
            Predefined_Groups_of_Metrics: [],
        };

        const got = getEventNames(listOutput);

        expect(got).toEqual(['alias-1', 'alias-2']);
    });
});
