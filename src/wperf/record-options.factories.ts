/**
 * Copyright (C) 2024 Arm Limited
 */

import { RecordOptions } from './record-options';

export const recordOptionsFactory = (options?: Partial<RecordOptions>): RecordOptions => ({
    events: options?.events ?? ['event1', 'event2'],
    frequency: options?.frequency ?? 100,
    core: options?.core ?? 1,
    command: options?.command ?? 'test command',
    timeoutSeconds: options && 'timeoutSeconds' in options ? options.timeoutSeconds : 10,
});
