/**
 * Copyright (C) 2024 Arm Limited
 */

import Ajv, { DefinedError } from 'ajv';

import * as schemaSample from './schemas/in/sample.json';
import { Sample as SchemaSample } from './schemas/out/sample';
import { percentage } from '../math';

type SchemaEvent = SchemaSample['sampling']['events'][number];
type SchemaAnnotation = SchemaEvent['annotate'][number];
type SchemaSourceCode = SchemaAnnotation['source_code'][number];

export type Sample = { sampling: Sampling };
type Sampling = { events: Event[] };
export type Event = Pick<
    SchemaEvent,
    | 'type'
> & {
    annotate: Annotation[]
    samples: EventSample[]
};
export type Annotation = Pick<SchemaAnnotation, 'function_name'> & {
    source_code: SourceCode[]
};
export type EventSample = SchemaEvent['samples'][number];
export type SourceCode = Pick<
    SchemaSourceCode,
    | 'filename'
    | 'hits'
    | 'line_number'
    | 'instruction_address'
    | 'disassembled_line'
> & {
    overhead: number
};

const ajv = new Ajv();
const validateSample = ajv.compile<SchemaSample>(schemaSample);

export const parseSampleJson = (json: string): Sample => {
    const data = JSON.parse(fixWperfOutput(json));
    if (validateSample(data)) {
        return parseSample(data);
    }
    throw new SchemaValidationError(validateSample.errors as DefinedError[]);
};

export const parseSample = (toParse: SchemaSample): Sample => {
    return {
        sampling: {
            ...toParse.sampling,
            events: toParse.sampling.events.map(event => ({
                ...event,
                annotate: event.annotate.map(embedSourceCodeOverhead),
            }))
        }
    };
};

const embedSourceCodeOverhead = (annotation: SchemaAnnotation): Annotation => {
    const totalHits = annotation.source_code.reduce(
        (totalHits, source) => totalHits + source.hits,
        0
    );

    return {
        ...annotation,
        source_code: annotation.source_code.map(source => ({
            ...source,
            overhead: percentage(source.hits, totalHits),
        }))
    };
};

// Wperf outputs literal tab characters in the "disassemble" > "instruction" fields.
// Literal tabs are not allowed in JSON string fields.
const fixWperfOutput = (content: string): string => {
    return content.replaceAll('\t', '    ');
};

export class SchemaValidationError extends Error {
    constructor(readonly validationErrors: DefinedError[]) {
        super('Parsed json does not match the schema');
        this.name = 'SchemaValidationError';
        Object.setPrototypeOf(this, SchemaValidationError.prototype);
    }
}
