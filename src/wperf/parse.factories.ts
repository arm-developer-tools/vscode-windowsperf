/**
 * Copyright (C) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';

import {
    Sample,
    Event,
    Annotation,
    SourceCode,
    EventSample,
    ListOutput,
    PredefinedEvent,
    PredefinedMetricGroup,
    PredefinedMetric,
} from './parse';

export const sampleFactory = (options?: Partial<{ events: Event[] }>): Sample => ({
    sampling: {
        events: options?.events ?? faker.helpers.multiple(eventFactory),
    },
});

export const eventFactory = (options?: Partial<Event>): Event => ({
    type: options?.type ?? faker.word.noun(),
    samples: options?.samples ?? faker.helpers.multiple(eventSampleFactory),
    annotate: options?.annotate ?? faker.helpers.multiple(annotationFactory),
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

const disassembledLineFactory = (): SourceCode['disassembled_line'] => ({
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

export const predefinedEventFactory = (options?: Partial<PredefinedEvent>): PredefinedEvent => ({
    Alias_Name: options?.Alias_Name ?? faker.word.noun(),
    Description: options?.Description ?? faker.lorem.sentence(),
    Raw_Index: options?.Raw_Index ?? faker.number.int().toString(),
    Event_Type: options?.Event_Type ?? faker.word.noun(),
});

export const predefinedMetricFactory = (options?: Partial<PredefinedMetric>): PredefinedMetric => ({
    Description: options?.Description ?? faker.lorem.sentence(),
    Events: options?.Events ?? faker.word.noun(),
    Formula: options?.Formula ?? faker.lorem.sentence(),
    Metric: options?.Metric ?? faker.word.noun(),
    Unit: options?.Unit ?? faker.word.noun(),
});

export const predefinedMetricGroupFactory = (
    options?: Partial<PredefinedMetricGroup>,
): PredefinedMetricGroup => ({
    Description: options?.Description ?? faker.lorem.sentence(),
    Group: options?.Group ?? faker.word.noun(),
    Metrics: options?.Metrics ?? faker.word.noun(),
});

export const listOutputFactory = (options?: Partial<ListOutput>): ListOutput => ({
    Predefined_Events: options?.Predefined_Events ?? faker.helpers.multiple(predefinedEventFactory),
    Predefined_Metrics:
        options?.Predefined_Metrics ?? faker.helpers.multiple(predefinedMetricFactory),
    Predefined_Groups_of_Metrics:
        options?.Predefined_Groups_of_Metrics ??
        faker.helpers.multiple(predefinedMetricGroupFactory),
});
