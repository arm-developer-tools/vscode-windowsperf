/*
 * Copyright (c) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';
import { RecordRun } from './record-run';
import { sampleFactory } from '../../wperf/parse.factories';

export const recordRunFactory = (options?: Partial<RecordRun>): RecordRun => {
    const command = options?.command ?? faker.word.noun();
    const parsedContent = options?.parsedContent ?? sampleFactory();
    return new RecordRun(command, parsedContent);
};
