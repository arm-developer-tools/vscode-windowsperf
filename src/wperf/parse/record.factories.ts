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

import { faker } from '@faker-js/faker';
import { Sample, Event, EventSample, Annotation, SourceCode, DisassembledLine } from './record';

export const sampleFactory = (options?: Partial<Sample>): Sample => ({
    events: options?.events ?? faker.helpers.multiple(eventFactory),
    totalCount: options?.totalCount ?? faker.number.int(),
});

export const eventFactory = (options?: Partial<Event>): Event => ({
    type: options?.type ?? faker.word.noun(),
    samples: options?.samples ?? faker.helpers.multiple(eventSampleFactory),
    annotate: options?.annotate ?? faker.helpers.multiple(annotationFactory),
    count: options?.count ?? faker.number.int(),
});

export const eventSampleFactory = (options?: Partial<EventSample>) => ({
    symbol: options?.symbol ?? faker.word.noun(),
    count: options?.count ?? faker.number.int(),
    overhead: options?.overhead ?? overheadFactory(),
});

export const annotationFactory = (options?: Partial<Annotation>): Annotation => ({
    function_name: options?.function_name ?? faker.word.noun(),
    source_code: options?.source_code ?? faker.helpers.multiple(sourceCodeFactory),
});

export const sourceCodeFactory = (options?: Partial<SourceCode>): SourceCode => {
    const disassembledLine = options?.disassembled_line ?? disassembledLineFactory();
    const instructionAddress = faker.helpers.arrayElement(disassembledLine.disassemble).address;

    return {
        filename: options?.filename ?? faker.system.filePath(),
        hits: options?.hits ?? faker.number.int(),
        line_number: options?.line_number ?? faker.number.int(),
        disassembled_line: disassembledLine,
        instruction_address: instructionAddress,
        overhead: options?.overhead ?? overheadFactory(),
    };
};

const disassembledLineFactory = (): DisassembledLine => ({
    disassemble: faker.helpers.multiple(() => ({
        address: faker.number.hex(),
        instruction: faker.helpers.arrayElement([
            'cmp x8 x9',
            'ldr x8, [sp, #0x10]',
            'mov x9 #0x7fffffe',
            'adrp x8, 0x180a3e000',
        ]),
    })),
});

const overheadFactory = (): number => {
    return faker.number.float({ max: 100, fractionDigits: 5 });
};
