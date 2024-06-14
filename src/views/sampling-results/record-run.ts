/*
 * Copyright (c) 2024 Arm Limited
 */

import { Sample } from '../../wperf/parse';

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

const generateTimeStamp = (): string => {
    const timeStamp = Date.now();
    const dateTime = new Date(timeStamp);
    return `${dateTime.getFullYear()}-${dateTime.getMonth() + 1}-${dateTime.getDate()} - ${dateTime.toTimeString()}`;
};
