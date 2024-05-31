/*
 * Copyright (c) 2024 Arm Limited
 */
import * as vscode from 'vscode';

import 'jest';
import { buildDecoration } from './source-code-decoration';
import { eventFactory, annotationFactory, sourceCodeFactory } from '../../wperf/parse.factories';
import { formatFraction } from '../../math';
import { textEditorColour } from './colours';

describe('buildDecoration', () => {
    describe('hover message', () => {
        it('describes the decorated event', () => {
            const event = eventFactory();
            const annotation = annotationFactory();
            const sourceCode = sourceCodeFactory();

            const got = buildDecoration(event, annotation, sourceCode).hoverMessage;

            expect(got).toContain(event.type);
            expect(got).toContain(annotation.function_name);
            expect(got).toContain(sourceCode.hits.toString());
            const wantOverhead = `${formatFraction(sourceCode.overhead)}%`;
            expect(got).toContain(wantOverhead);
        });

        it('contains the disassembly', () => {
            const sourceCode = sourceCodeFactory();

            const got = buildDecoration(
                eventFactory(),
                annotationFactory(),
                sourceCode,
            ).hoverMessage;

            for (const line of sourceCode.disassembled_line.disassemble) {
                expect(got).toContain(line.address);
                expect(got).toContain(line.instruction);
            }
        });
    });

    describe('editor decorations', () => {
        it('in-line text decoration appears with overhead % and hit count', () => {
            const event = eventFactory();
            const annotation = annotationFactory();
            const sourceCode = sourceCodeFactory();

            const got = buildDecoration(event, annotation, sourceCode).after;

            const want = {
                contentText: `${formatFraction(sourceCode.overhead)}% (${sourceCode.hits} hits)`,
                fontStyle: 'italic',
                margin: '30px',
                color: new vscode.ThemeColor('editor.inlineValuesForeground')
            };
            expect(got).toEqual(want);
        });

        it.each([
            { overhead: 100, want: textEditorColour(100) },
            { overhead: 20, want: textEditorColour(20) },
            { overhead: 5, want: textEditorColour(5) }
        ])('returns editor background colour $want from $overhead value treshold', ({ overhead, want }) => {
            const event = eventFactory();
            const annotation = annotationFactory();
            const sourceCode = sourceCodeFactory({ overhead });

            const got = buildDecoration(event, annotation, sourceCode).backgroundColor;

            expect(got).toBe(want);
        });
    });
});
