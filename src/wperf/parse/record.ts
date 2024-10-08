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

import * as z from 'zod';
import { percentage } from '../../math';
import { validateAgainstShape } from './validate';

const disassemblyInstructionShape = z.object({
    address: z.string(),
    instruction: z.string(),
});

const disassembledLineShape = z.object({
    disassemble: z.array(disassemblyInstructionShape),
});

const sourceCodeShape = z.object({
    filename: z.string(),
    hits: z.number(),
    line_number: z.number(),
    instruction_address: z.string().optional(), // Not present when --disassemble is not used
    disassembled_line: disassembledLineShape.optional(), // Not present when --disassemble is not used
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

export type DisassemblyInstruction = z.infer<typeof disassemblyInstructionShape>;
export type DisassembledLine = z.infer<typeof disassembledLineShape>;
export type SourceCode = z.infer<typeof sourceCodeShape> & { overhead: number };
export type Annotation = AnnotationJson & { source_code: SourceCode[] };
export type EventSample = z.infer<typeof eventSampleShape>;
export type Event = z.infer<typeof eventShape> & { annotate: Annotation[]; count: number };
export type Sample = { events: Event[]; totalCount: number };
export interface SampleHitDetails {
    eventType: string;
    functionName: string;
    sourceCode: SourceCode;
}

export const parseSample = (toParse: RecordJsonOutput): Sample => {
    const events = toParse.sampling.events.map((event) => ({
        ...event,
        count: event.samples.reduce((totalHits, sample) => totalHits + sample.count, 0),
        annotate: event.annotate.map(embedSourceCodeOverhead),
    }));

    return {
        events,
        totalCount: events.reduce((a, c) => a + c.count, 0),
    };
};

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

export const getEventsWithUnknownSymbol = (sample: Sample): string[] => {
    const eventsWithUnknownSymbol: string[] = [];
    for (const event of sample.events) {
        if (event.samples.length === 1 && event.samples.at(0)?.symbol === 'unknown') {
            eventsWithUnknownSymbol.push(event.type);
        }
    }
    return eventsWithUnknownSymbol;
};

export const groupHitsByFiles = (sample: Sample): Map<string, SampleHitDetails[]> => {
    const groupedByFileMap = new Map<string, SampleHitDetails[]>();
    for (const event of sample.events) {
        for (const annotation of event.annotate) {
            for (const sourceCode of annotation.source_code) {
                const nameKey = sourceCode.filename;
                const found = groupedByFileMap.get(nameKey);
                const newContent: SampleHitDetails = {
                    eventType: event.type,
                    functionName: annotation.function_name,
                    sourceCode,
                };
                groupedByFileMap.set(nameKey, found ? [...found, newContent] : [newContent]);
            }
        }
    }

    return groupedByFileMap;
};

interface GroupedByLine {
    lineNumber: number;
    content: SampleHitDetails[];
    lineHits: number;
}

export const groupHitsOnSameFileLine = (
    fileContent: SampleHitDetails[],
): Map<number, GroupedByLine> => {
    const groupedByLineMap = new Map<number, GroupedByLine>();
    for (const content of fileContent) {
        const key = content.sourceCode.line_number;
        const found = groupedByLineMap.get(key);
        const lineHits = found
            ? (found.lineHits += content.sourceCode.hits)
            : content.sourceCode.hits;
        groupedByLineMap.set(key, {
            lineNumber: key,
            content: found ? [...found.content, content] : [content],
            lineHits,
        });
    }

    return groupedByLineMap;
};
