/*
 * Copyright (c) 2024 Arm Limited
 */
import * as vscode from 'vscode';

import 'jest';
import { buildDecoration } from './source-code-decoration';
import { eventFactory, annotationFactory, sourceCodeFactory } from '../../wperf/parse.factories';
import { formatFraction } from '../../math';

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
            { hits: 100, want: 'rgba(255, 0, 0, 0.2)' },
            { hits: 20, want: 'rgba(255, 255, 0, 0.2)' },
            { hits: 5, want: 'rgba(100, 100, 100, 0.2)' }
        ])('returns editor background colour $want from $hits value treshold', ({ hits, want }) => {
            const event = eventFactory();
            const annotation = annotationFactory();
            const sourceCode = sourceCodeFactory({ hits });

            const got = buildDecoration(event, annotation, sourceCode).backgroundColor;

            expect(got).toBe(want);
        });
    });
});
