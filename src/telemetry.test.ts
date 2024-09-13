/**
 * Copyright 2024 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
