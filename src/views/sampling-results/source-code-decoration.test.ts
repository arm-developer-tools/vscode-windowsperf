/*
 * Copyright (c) 2024 Arm Limited
 */

import 'jest';
import { buildDecoration } from './source-code-decorations';
import { eventFactory, annotationFactory, sourceCodeFactory } from '../../wperf/parse.factories';

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
            expect(got).toContain(sourceCode.overhead.toString());
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
