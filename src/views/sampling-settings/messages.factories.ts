/**
 * Copyright (C) 2024 Arm Limited
 */

import { predefinedEventFactory } from '../../wperf/parse/list.factories';
import { recordOptionsFactory } from '../../wperf/record-options.factories';
import { FromView, ToView } from './messages';

export const recordOptionsFromViewFactory = (
    options?: Partial<Extract<FromView, { type: 'recordOptions' }>>,
): Extract<FromView, { type: 'recordOptions' }> => ({
    type: 'recordOptions',
    recordOptions: options?.recordOptions ?? recordOptionsFactory(),
});

export const initialDataToViewFactory = (
    options?: Partial<Extract<ToView, { type: 'initialData' }>>,
): Extract<ToView, { type: 'initialData' }> => ({
    type: 'initialData',
    cores: options?.cores ?? [],
    events: options?.events ?? { type: 'success', events: [predefinedEventFactory()] },
    recordOptions: options?.recordOptions ?? recordOptionsFactory(),
    validate: options?.validate ?? false,
});

export const selectedCommandToViewFactory = (
    options?: Partial<Extract<ToView, { type: 'selectedCommand' }>>,
): Extract<ToView, { type: 'selectedCommand' }> => ({
    type: 'selectedCommand',
    command: options?.command ?? '',
});
