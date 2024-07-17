/**
 * Copyright (C) 2024 Arm Limited
 */

import { predefinedEventFactory } from '../../wperf/parse/list.factories';
import { recordOptionsFactory } from '../../wperf/record-options.factories';
import { LoadedState } from './reducer';

export const loadedStateFactory = (options?: Partial<Omit<LoadedState, 'type'>>): LoadedState => ({
    type: 'loaded',
    cores: options?.cores ?? [],
    events: options?.events ?? [predefinedEventFactory()],
    recordOptions: recordOptionsFactory(),
});
