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

import { RecordOptions } from './wperf/record-options';

export const getRecordTelemetryEventProperties = (
    recordOptions: RecordOptions,
): { events: string; timeout: string | undefined } => {
    return {
        events: JSON.stringify(recordOptions.events),
        timeout: recordOptions.timeoutSeconds?.toString(),
    };
};
