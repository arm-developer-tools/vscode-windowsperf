/*
 * Copyright (c) 2024 Arm Limited
 */

import { SampleFile } from './sample-file';
import { RecordRun } from './record-run';
import { randomUUID } from 'crypto';

export const isSourceSampleFile = (source: Source): source is SourceSampleFile =>
    source.type === 'file';

export const isSourceRecordRun = (source: Source): source is SourceRecordRun =>
    source.type === 'run';

export type SourceSampleFile = { type: 'file'; result: SampleFile };
export type SourceRecordRun = { type: 'run'; result: RecordRun };

export type Source = SourceSampleFile | SourceRecordRun;

export class SampleSource {
    readonly id: string;

    static fromSampleFile(file: SampleFile): SampleSource {
        return new SampleSource({ type: 'file', result: file });
    }
    static fromRecordRun(run: RecordRun): SampleSource {
        return new SampleSource({ type: 'run', result: run });
    }

    constructor(readonly context: Source) {
        this.id = randomUUID();
    }
}
