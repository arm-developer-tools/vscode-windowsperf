/*
 * Copyright (c) 2024 Arm Limited
 */

import { RecordRun } from './record-run';
import { sampleFactory } from '../../wperf/parse.factories';
import { recordOptionsFactory } from '../../wperf/run.factories';

export const recordRunFactory = (options?: Partial<RecordRun>): RecordRun => {
    const parsedContent = options?.parsedContent ?? sampleFactory();
    const recordOptions = options?.recordOptions ?? recordOptionsFactory();
    return new RecordRun(recordOptions, parsedContent);
};
