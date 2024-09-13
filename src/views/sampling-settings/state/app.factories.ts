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
import { predefinedEventFactory } from '../../../wperf/parse/list.factories';
import { recordOptionsFactory } from '../../../wperf/record-options.factories';
import { LoadedState } from './app';
import { eventsEditorAddingStateFactory } from './events-editor.factories';
import { testResultsFactory } from '../../../wperf/parse/test.factories';

export const loadedStateFactory = (options?: Partial<Omit<LoadedState, 'type'>>): LoadedState => ({
    type: 'loaded',
    cores: [],
    events: [predefinedEventFactory()],
    recentEvents: [faker.word.noun()],
    recordOptions: recordOptionsFactory(),
    fieldsToValidate: [],
    eventsEditor: eventsEditorAddingStateFactory(),
    testResults: testResultsFactory(),
    hasLlvmObjDumpPath: false,
    ...options,
});
