/*
 * Copyright (c) 2024 Arm Limited
 */

import { Sample } from '../../wperf/parse';
import { generateTimeStamp } from './date';
import { RecordOptions } from '../../wperf/run';

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
}
