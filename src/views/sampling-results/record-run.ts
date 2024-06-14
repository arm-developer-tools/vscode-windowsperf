/*
 * Copyright (c) 2024 Arm Limited
 */

import { Sample } from '../../wperf/parse';
import { generateTimeStamp } from './date';

export class RecordRun {
    private readonly timestamp: string;

    constructor(
        readonly command: string,
        readonly parsedContent: Sample,
    ) {
        this.timestamp = generateTimeStamp();
    }

    get displayName(): string {
        return this.command;
    }

    get date(): string {
        return this.timestamp;
    }

    get displayLog(): string {
        return this.command;
    }
}
