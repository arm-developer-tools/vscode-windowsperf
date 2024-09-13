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
