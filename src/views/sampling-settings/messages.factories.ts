/**
 * Copyright (C) 2024 Arm Limited
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
