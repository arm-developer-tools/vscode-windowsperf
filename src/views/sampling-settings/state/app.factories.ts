/**
 * Copyright (C) 2024 Arm Limited
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
