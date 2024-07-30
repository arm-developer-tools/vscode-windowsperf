/**
 * Copyright (C) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';
import { EventAndFrequency, RecordOptions } from './record-options';

export const eventAndFrequencyFactory = (
    options?: Partial<EventAndFrequency>,
): EventAndFrequency => ({
    event: options?.event ?? faker.word.noun(),
    frequency: options && 'frequency' in options ? options.frequency : faker.number.int(),
});

export const recordOptionsFactory = (options?: Partial<RecordOptions>): RecordOptions => ({
    events: options?.events ?? faker.helpers.multiple(eventAndFrequencyFactory),
    core: options?.core ?? 1,
    command: options?.command ?? 'test-command',
    arguments: options?.arguments ?? '--some-flag --another-flag',
    timeoutSeconds: options && 'timeoutSeconds' in options ? options.timeoutSeconds : 10,
});
