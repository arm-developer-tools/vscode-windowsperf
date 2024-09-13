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

import * as vscode from 'vscode';

import 'jest';
import { buildDecoration } from './source-code-decoration';
import { formatFraction, percentage } from '../../math';
import { textEditorColour } from './colours';
import {
    eventFactory,
    annotationFactory,
    sourceCodeFactory,
} from '../../wperf/parse/record.factories';

describe('buildDecoration', () => {
    describe('hover message', () => {
        it('describes the decorated event', () => {
            const event = eventFactory();
            const annotation = annotationFactory();
            const sourceCode = sourceCodeFactory();

            const got = buildDecoration({
                filename: sourceCode.filename,
                lineNumber: sourceCode.line_number,
                content: [
                    {
                        eventType: event.type,
                        functionName: annotation.function_name,
                        sourceCode,
                    },
                ],
                lineHits: sourceCode.hits,
                totalSampleHits: sourceCode.hits,
            }).hoverMessage;

            expect(got).toContain(event.type);
            expect(got).toContain(annotation.function_name);
            expect(got).toContain(sourceCode.hits.toString());
            const wantOverhead = `${formatFraction(sourceCode.overhead)}%`;
            expect(got).toContain(wantOverhead);
        });

        it('contains the disassembly', () => {
            const sourceCode = sourceCodeFactory();

            const got = buildDecoration({
                filename: sourceCode.filename,
                lineNumber: sourceCode.line_number,
                content: [
                    {
                        eventType: eventFactory().type,
                        functionName: annotationFactory().function_name,
                        sourceCode,
                    },
                ],
                lineHits: sourceCode.hits,
                totalSampleHits: sourceCode.hits,
            }).hoverMessage;
            for (const line of sourceCode.disassembled_line!.disassemble) {
                expect(got).toContain(line.address);
                expect(got).toContain(line.instruction);
            }
        });

        it('contains the total section when there are multiple events', () => {
            const sourceCode = sourceCodeFactory();

            const got = buildDecoration({
                filename: sourceCode.filename,
                lineNumber: sourceCode.line_number,
                content: [
                    {
                        eventType: eventFactory().type,
                        functionName: annotationFactory().function_name,
                        sourceCode,
                    },
                    {
                        eventType: eventFactory().type,
                        functionName: annotationFactory().function_name,
                        sourceCode,
                    },
                ],
                lineHits: sourceCode.hits + sourceCode.hits,
                totalSampleHits: sourceCode.hits + sourceCode.hits,
            }).hoverMessage;

            expect(got).toContain(`100% (${sourceCode.hits + sourceCode.hits} hits)`);
        });
    });

    describe('editor decorations', () => {
        it('in-line text decoration appears with overhead % and hit count', () => {
            const sourceCode = sourceCodeFactory();

            const got = buildDecoration({
                filename: sourceCode.filename,
                lineNumber: sourceCode.line_number,
                content: [
                    {
                        eventType: eventFactory().type,
                        functionName: annotationFactory().function_name,
                        sourceCode,
                    },
                ],
                lineHits: sourceCode.hits,
                totalSampleHits: sourceCode.hits,
            });

            const want = {
                contentText: `${formatFraction(percentage(sourceCode.hits, sourceCode.hits))}% (${sourceCode.hits} hits)`,
                fontStyle: 'italic',
                margin: '30px',
                color: new vscode.ThemeColor('editor.inlineValuesForeground'),
            };
            expect(got.after).toEqual(want);
        });

        it.each([
            { hits: 100, total: 100, want: textEditorColour(100) },
            { hits: 20, total: 100, want: textEditorColour(20) },
            { hits: 5, total: 100, want: textEditorColour(5) },
        ])(
            'returns editor background colour $want from $hits value treshold',
            ({ hits, total, want }) => {
                const sourceCode = sourceCodeFactory({ hits });

                const got = buildDecoration({
                    filename: sourceCode.filename,
                    lineNumber: sourceCode.line_number,
                    content: [
                        {
                            eventType: eventFactory().type,
                            functionName: annotationFactory().function_name,
                            sourceCode,
                        },
                    ],
                    lineHits: hits,
                    totalSampleHits: total,
                }).backgroundColor;

                expect(got).toBe(want);
            },
        );
    });
});
