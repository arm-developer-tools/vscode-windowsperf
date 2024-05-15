/*
 * Copyright (c) 2024 Arm Limited
 */

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
});
