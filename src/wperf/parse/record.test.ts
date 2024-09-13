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
import {
    getEventsWithUnknownSymbol,
    groupHitsByFiles,
    groupHitsOnSameFileLine,
    parseRecordJson,
    parseSample,
} from './record';
import { loadFixtureFile } from '../fixtures';
import { ValidationError } from './validation-error';
import { percentage } from '../../math';
import {
    annotationFactory,
    eventFactory,
    eventSampleFactory,
    sourceCodeFactory,
} from './record.factories';

describe('record', () => {
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

            expect(got).toEqual({ totalCount: 0, events: [] });
        });

        it('parses wperf output json generated with the --disassemble option', async () => {
            const json = await loadFixtureFile('wperf-3.3.3.record.json');

            const got = parseRecordJson(json);

            expect(got.events.length).toBeGreaterThan(0);
        });

        it('returns count value', () => {
            const event1 = eventFactory();
            const data = {
                sampling: {
                    sample_display_row: 10,
                    samples_generated: 1337,
                    samples_dropped: 10,
                    pe_file: 'some-pe-file',
                    pdb_file: 'some-pdb-file',
                    events: [event1],
                },
            };
            const json = JSON.stringify(data);

            const got = parseRecordJson(json);
            const want = event1.samples.reduce((a, c) => a + c.count, 0);

            expect(got.totalCount).toEqual(want);
        });

        it('parses wperf output json generated with the --annotate option but without the --disassemble option', async () => {
            const json = await loadFixtureFile('wperf-3.5.0.record-no-disassembly.json');

            const got = parseRecordJson(json);

            expect(got.events.length).toBeGreaterThan(0);
        });

        it('uses sample parser to pre-calculate additional fields', async () => {
            const json = await loadFixtureFile('wperf-3.3.3.record.json');

            const got = parseRecordJson(json);

            expect(got.events[0]!.annotate[0]!.source_code[0]!.overhead).not.toBeUndefined();
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
            const sourceCode1 = sourceCodeFactory({ filename: 'file-1.c', hits: 53 });
            const sourceCode2 = sourceCodeFactory({ filename: 'file-2.c', hits: 31 });
            const sourceCode3 = sourceCodeFactory({ filename: 'file-a.c', hits: 3 });
            const sourceCode4 = sourceCodeFactory({ filename: 'file-b.c', hits: 5 });
            const sourceCode5 = sourceCodeFactory({ filename: 'file-c.c', hits: 2 });
            const toParse = {
                sampling: {
                    events: [
                        eventFactory({
                            annotate: [
                                {
                                    function_name: 'add',
                                    source_code: [sourceCode1, sourceCode2],
                                },
                                {
                                    function_name: 'multiply',
                                    source_code: [sourceCode3, sourceCode4, sourceCode5],
                                },
                            ],
                        }),
                    ],
                },
            };

            const got = parseSample(toParse).events[0]!.annotate;

            const wantAnnote = [
                {
                    function_name: 'add',
                    source_code: [
                        { ...sourceCode1, overhead: percentage(53, 53 + 31) },
                        { ...sourceCode2, overhead: percentage(31, 53 + 31) },
                    ],
                },
                {
                    function_name: 'multiply',
                    source_code: [
                        { ...sourceCode3, overhead: percentage(3, 3 + 5 + 2) },
                        { ...sourceCode4, overhead: percentage(5, 3 + 5 + 2) },
                        { ...sourceCode5, overhead: percentage(2, 3 + 5 + 2) },
                    ],
                },
            ];
            expect(wantAnnote).toEqual(got);
        });
    });

    describe('getEventsWithUnknownSymbol', () => {
        const unknownEventSample = eventSampleFactory({ symbol: 'unknown' });

        it('includes events which only have an unknown symbol', () => {
            const sample = {
                events: [
                    eventFactory({ type: 'add' }),
                    eventFactory({ type: 'mult' }),
                    eventFactory({ type: 'shift', samples: [unknownEventSample] }),
                ],
                totalCount: 100,
            };

            expect(getEventsWithUnknownSymbol(sample)).toEqual(['shift']);
        });

        it('does not include events with both an unknown symbol and a known symbol', () => {
            const knownEventSample = eventSampleFactory({ symbol: 'lib.dll' });
            const sample = {
                events: [
                    eventFactory({ type: 'div' }),
                    eventFactory({ type: 'interupt' }),
                    eventFactory({ type: 'load', samples: [unknownEventSample, knownEventSample] }),
                ],
                totalCount: 100,
            };

            expect(getEventsWithUnknownSymbol(sample)).toEqual([]);
        });
    });

    describe('groupHitsByFiles', () => {
        it('group multiple files of the same name correctly in mapped output', () => {
            const sourceCode = sourceCodeFactory({ filename: 'file-1' });
            const annotation = annotationFactory({ source_code: [sourceCode] });
            const sampleA = eventFactory({ annotate: [annotation] });
            const sampleB = eventFactory({ annotate: [annotation] });
            const sample = { events: [sampleA, sampleB], totalCount: 100 };

            expect(groupHitsByFiles(sample).get('file-1')).toEqual([
                {
                    eventType: sampleA.type,
                    functionName: annotation.function_name,
                    sourceCode: sourceCode,
                },
                {
                    eventType: sampleB.type,
                    functionName: annotation.function_name,
                    sourceCode: sourceCode,
                },
            ]);
        });
    });

    describe('groupHitsOnSameFileLine', () => {
        it('group multiple lines into the mapped output', () => {
            const content = [
                {
                    eventType: eventFactory().type,
                    functionName: annotationFactory().function_name,
                    sourceCode: sourceCodeFactory({
                        filename: 'file-1',
                        line_number: 1,
                        hits: 100,
                    }),
                    totalSampleHits: 100,
                },
                {
                    eventType: eventFactory().type,
                    functionName: annotationFactory().function_name,
                    sourceCode: sourceCodeFactory({
                        filename: 'file-2',
                        line_number: 1,
                        hits: 100,
                    }),
                    totalSampleHits: 100,
                },
            ];

            expect(groupHitsOnSameFileLine(content).get(1)).toEqual({
                lineNumber: 1,
                content: [content[0], content[1]],
                lineHits: 200,
            });
        });
    });
});
