/**
 * Copyright (C) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';

import { Sample, Event, Annotation, SourceCode } from './projected-types';

export const sampleFactory = (options?: Partial<{ events: Event[] }>): Sample => ({
    sampling: {
        events: options?.events ?? faker.helpers.multiple(eventFactory)
    }
});

export const eventFactory = (options?: Partial<Event>): Event => ({
    type: options?.type ?? faker.word.noun(),
    annotate: options?.annotate ?? faker.helpers.multiple(annotationFactory),
});

export const annotationFactory = (options?: Partial<Annotation>): Annotation => ({
    function_name: options?.function_name ?? faker.word.noun(),
    source_code: options?.source_code ?? faker.helpers.multiple(sourceCodeFactory),
});

export const sourceCodeFactory = (options?: Partial<SourceCode>): SourceCode => {
    const disassembled_line =
        options?.disassembled_line ?? disassembledLineFactory();
    const instruction_address = faker.helpers.arrayElement(disassembled_line.disassemble).address;

    return {
        filename: options?.filename ?? faker.system.filePath(),
        hits: options?.hits ?? faker.number.int(),
        line_number: options?.line_number ?? faker.number.int(),
        disassembled_line,
        instruction_address,
    };
};

const disassembledLineFactory = (): SourceCode['disassembled_line'] => ({
    disassemble: faker.helpers.multiple(() => ({
        address: faker.number.hex(),
        instruction: faker.helpers.arrayElement([
            'cmp x8 x9',
            'ldr x8, [sp, #0x10]',
            'mov x9 #0x7fffffe',
            'adrp x8, 0x180a3e000'
        ]),
    })),
});
