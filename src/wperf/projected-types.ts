/**
 * Copyright (C) 2024 Arm Limited
 */

import { Sample as SchemaSample } from './schemas/out/sample';
type SchemaEvent = SchemaSample['sampling']['events'][number];
type SchemaAnnotation = SchemaEvent['annotate'][number];
type SchemaSourceCode = SchemaAnnotation['source_code'][number];

export type Sample = { sampling: Sampling };
type Sampling = { events: Event[] };
export type Event = Pick<SchemaEvent, 'type'> & {
    annotate: Annotation[]
};
export type Annotation = Pick<SchemaAnnotation, 'function_name'> & {
    source_code: SourceCode[]
};
export type SourceCode = Pick<SchemaSourceCode, 'filename' | 'hits'>;
