/**
 * Copyright (C) 2024 Arm Limited
 */

import * as z from 'zod';
import { percentage } from '../../math';
import { validateAgainstShape } from './validate';

const sourceCodeShape = z.object({
    filename: z.string(),
    hits: z.number(),
    line_number: z.number(),
    instruction_address: z.string(),
    disassembled_line: z.object({
        disassemble: z.array(
            z.object({
                address: z.string(),
                instruction: z.string(),
            }),
        ),
    }),
});

const annotationShape = z.object({
    function_name: z.string(),
    source_code: z.array(sourceCodeShape),
});

const eventSampleShape = z.object({
    overhead: z.number(),
    count: z.number(),
    symbol: z.string(),
});

const eventShape = z.object({
    type: z.string(),
    // TODO: Make this optional
    annotate: z.array(annotationShape),
    samples: z.array(eventSampleShape),
});

const recordOutputShape = z.object({
    sampling: z.object({
        events: z.array(eventShape),
    }),
});

export type RecordJsonOutput = z.infer<typeof recordOutputShape>;
type AnnotationJson = z.infer<typeof annotationShape>;

export type SourceCode = z.infer<typeof sourceCodeShape> & { overhead: number };
export type Annotation = AnnotationJson & { source_code: SourceCode[] };

export type EventSample = z.infer<typeof eventSampleShape>;
export type Event = z.infer<typeof eventShape> & { annotate: Annotation[] };
export type Sample = Event[];

export const parseSample = (toParse: RecordJsonOutput): Sample =>
    toParse.sampling.events.map((event) => ({
        ...event,
        annotate: event.annotate.map(embedSourceCodeOverhead),
    }));

export const parseRecordJson = (json: string): Sample => {
    const data = JSON.parse(fixWperfOutput(json));
    const result = validateAgainstShape(recordOutputShape, data);
    return parseSample(result);
};

// Wperf outputs literal tab characters in the "disassemble" > "instruction" fields.
// Literal tabs are not allowed in JSON string fields.
const fixWperfOutput = (content: string): string => {
    return content.replaceAll('\t', '    ');
};

const embedSourceCodeOverhead = (annotation: AnnotationJson): Annotation => {
    const totalHits = annotation.source_code.reduce(
        (totalHits, source) => totalHits + source.hits,
        0,
    );

    return {
        ...annotation,
        source_code: annotation.source_code.map((source) => ({
            ...source,
            overhead: percentage(source.hits, totalHits),
        })),
    };
};
