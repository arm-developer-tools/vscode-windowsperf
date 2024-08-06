/**
 * Copyright (C) 2024 Arm Limited
 */

import { eventAndFrequencyFactory } from '../../../wperf/record-options.factories';
import { EventsEditorAddingState, EventsEditorEditingState } from './events-editor';

export const eventsEditorEditingStateFactory = (
    options?: Partial<Omit<EventsEditorEditingState, 'type'>>,
): EventsEditorEditingState => ({
    type: 'editing',
    index: options?.index ?? 0,
    event: options?.event ?? eventAndFrequencyFactory(),
});

export const eventsEditorAddingStateFactory = (
    options?: Partial<Omit<EventsEditorAddingState, 'type'>>,
): EventsEditorAddingState => ({
    type: 'adding',
    event: options?.event ?? eventAndFrequencyFactory(),
});
