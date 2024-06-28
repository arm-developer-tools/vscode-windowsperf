/*
 * Copyright (c) 2024 Arm Limited
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
