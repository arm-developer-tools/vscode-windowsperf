/**
 * Copyright (C) 2024 Arm Limited
 */

import Ajv, { DefinedError } from 'ajv';

import * as schemaSample from './schemas/in/sample.json';
import * as schemaList from './schemas/in/list.json';
import { Sample as SchemaSample } from './schemas/out/sample';
import { percentage } from '../math';
import { List as SchemaList } from './schemas/out/list';
import { PrintableError } from '../logging/printable-error';

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

export type ListOutput = Required<SchemaList>;

const ajv = new Ajv();
const validateSample = ajv.compile<SchemaSample>(schemaSample);
const validateList = ajv.compile<SchemaList>(schemaList);

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

export const parseListJson = (json: string): ListOutput => {
    const data = JSON.parse(json);
    if (validateList(data)) {
        return parseList(data);
    }
    throw new SchemaValidationError(validateList.errors as DefinedError[]);
};

export const parseList = (toParse: SchemaList): ListOutput => {
    return {
        ...toParse,
        Predefined_Groups_of_Metrics: toParse.Predefined_Groups_of_Metrics ?? [],
    };
};

export class SchemaValidationError extends Error implements PrintableError {
    constructor(readonly validationErrors: DefinedError[]) {
        super('Parsed json does not match the schema');
        this.name = 'SchemaValidationError';
        Object.setPrototypeOf(this, SchemaValidationError.prototype);
    }

    readonly getDisplayMessage = () => {
        const validationErrorStrings = this.validationErrors.map(
            error => `${error.instancePath}: ${error.message || error.keyword}`
        );

        return [
            this.message,
            ...validationErrorStrings,
        ].join('\n    ');
    };
}
