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

import { Sample } from '../../wperf/parse/record';
import { RecordOptions } from '../../wperf/record-options';
import { generateTimeStamp } from './date';

export class RecordRun {
    private readonly timestamp: string;

    constructor(
        readonly recordOptions: RecordOptions,
        readonly parsedContent: Sample,
    ) {
        this.timestamp = generateTimeStamp();
    }

    get displayName(): string {
        return this.recordOptions.command;
    }

    get date(): string {
        return this.timestamp;
    }

    get displayLog(): string {
        return this.recordOptions.command;
    }

    get treeContextName(): string {
        return 'recordRun';
    }
}
