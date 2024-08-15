/*
 * Copyright (c) 2024 Arm Limited
 */

import { getRecordTelemetryEventProperties } from './telemetry';
import { recordOptionsFactory } from './wperf/record-options.factories';

describe('getRecordTelemetryEventProperties', () => {
    it('correctly formats the properties of the recordOption', () => {
        const partialEvents = [
            {
                event: 'overflow',
            },
            {
                event: 'underflow',
            },
            {
                event: 'null_pointer_exception',
            },
        ];
        const recordOptions = recordOptionsFactory({ events: partialEvents });
        const properties = getRecordTelemetryEventProperties(recordOptions);

        expect(properties).toEqual({
            events: JSON.stringify(partialEvents),
            timeout: '10',
        });
    });
});
