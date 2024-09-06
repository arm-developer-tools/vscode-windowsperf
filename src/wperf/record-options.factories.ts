/**
 * Copyright (C) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';
import { EventAndFrequency, RecordOptions } from './record-options';

export const eventAndFrequencyFactory = (
    options?: Partial<EventAndFrequency>,
): EventAndFrequency => ({
    event: faker.word.noun(),
    frequency: faker.number.int(),
    ...options,
});

export const recordOptionsFactory = (options?: Partial<RecordOptions>): RecordOptions => ({
    events: faker.helpers.multiple(eventAndFrequencyFactory),
    core: 1,
    command: 'test-command',
    arguments: '--some-flag --another-flag',
    timeoutSeconds: 10,
    disassembleEnabled: false,
    ...options,
});
