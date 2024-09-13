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
import { predefinedEventFactory } from '../../wperf/parse/list.factories';
import { recordOptionsFactory } from '../../wperf/record-options.factories';
import { FromView, ToView } from './messages';
import { testResultsFactory } from '../../wperf/parse/test.factories';

export const recordOptionsFromViewFactory = (
    options?: Partial<Extract<FromView, { type: 'recordOptions' }>>,
): Extract<FromView, { type: 'recordOptions' }> => ({
    type: 'recordOptions',
    recordOptions: recordOptionsFactory(),
    ...options,
});

export const initialDataToViewFactory = (
    options?: Partial<Extract<ToView, { type: 'initialData' }>>,
): Extract<ToView, { type: 'initialData' }> => ({
    type: 'initialData',
    cores: [],
    eventsAndTestLoadResult: {
        type: 'success',
        events: [predefinedEventFactory()],
        testResults: testResultsFactory(),
    },
    recordOptions: recordOptionsFactory(),
    recentEvents: [faker.word.noun()],
    validate: false,
    hasLlvmObjDumpPath: false,
    ...options,
});

export const selectedCommandToViewFactory = (
    options?: Partial<Extract<ToView, { type: 'selectedCommand' }>>,
): Extract<ToView, { type: 'selectedCommand' }> => ({
    type: 'selectedCommand',
    command: '',
    ...options,
});
