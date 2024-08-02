/**
 * Copyright (C) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';
import { predefinedEventFactory } from '../../../wperf/parse/list.factories';
import { recordOptionsFactory } from '../../../wperf/record-options.factories';
import { LoadedState } from './app';

export const loadedStateFactory = (options?: Partial<Omit<LoadedState, 'type'>>): LoadedState => ({
    type: 'loaded',
    cores: options?.cores ?? [],
    events: options?.events ?? [predefinedEventFactory()],
    recentEvents: options?.recentEvents ?? [faker.word.noun()],
    recordOptions: options?.recordOptions ?? recordOptionsFactory(),
    fieldsToValidate: options?.fieldsToValidate ?? [],
});
