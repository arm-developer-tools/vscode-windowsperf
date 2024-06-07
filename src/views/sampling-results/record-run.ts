/*
 * Copyright (c) 2024 Arm Limited
 */

import { randomUUID } from 'crypto';
import { Sample } from '../../wperf/parse';

export class RecordRun {
    readonly id: string;
    readonly timestamp: string;

    constructor(
        readonly command: string,
        readonly parsedContent: Sample
    ) {
        this.id = randomUUID();
        this.timestamp = this.generateTimestamp();
    }

    get displayName(): string {
        return `Command: ${this.command}`;
    }

    get date(): string {
        return this.timestamp;
    }

    private readonly generateTimestamp = () => {
        const timeStamp = Date.now();
        const dateTime = new Date(timeStamp);
        return `Date: ${dateTime.getFullYear()}-${dateTime.getMonth() + 1}-${dateTime.getDate()} - ${dateTime.toTimeString()}`;
    };
}
