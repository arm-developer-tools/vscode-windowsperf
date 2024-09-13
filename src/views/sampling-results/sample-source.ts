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
