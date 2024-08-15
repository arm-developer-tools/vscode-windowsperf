/**
 * Copyright (C) 2024 Arm Limited
 */

import { RecordOptions } from './wperf/record-options';

export const getRecordTelemetryEventProperties = (
    recordOptions: RecordOptions,
): { events: string; timeout: string | undefined } => {
    return {
        events: JSON.stringify(recordOptions.events),
        timeout: recordOptions.timeoutSeconds?.toString(),
    };
};
