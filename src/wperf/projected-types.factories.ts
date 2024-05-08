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

export const sourceCodeFactory = (options?: Partial<SourceCode>): SourceCode => ({
    filename: options?.filename ?? faker.system.filePath(),
    hits: options?.hits ?? faker.number.int(),
});
