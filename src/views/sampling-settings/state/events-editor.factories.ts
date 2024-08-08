/**
 * Copyright (C) 2024 Arm Limited
 */

import { eventAndFrequencyFactory } from '../../../wperf/record-options.factories';
import { EventsEditorAddingState, EventsEditorEditingState } from './events-editor';

const commonEventsEditorStateFactory = (
    options?: Partial<Pick<EventsEditorAddingState, 'event' | 'validateMissingFields'>>,
): Pick<EventsEditorAddingState, 'event' | 'validateMissingFields'> => {
    return {
        event: options?.event ?? eventAndFrequencyFactory(),
        validateMissingFields:
            options && typeof options.validateMissingFields === 'boolean'
                ? options.validateMissingFields
                : false,
    };
};

export const eventsEditorEditingStateFactory = (
    options?: Partial<Omit<EventsEditorEditingState, 'type'>>,
): EventsEditorEditingState => ({
    ...commonEventsEditorStateFactory(options),
    type: 'editing',
    index: options?.index ?? 0,
});

export const eventsEditorAddingStateFactory = (
    options?: Partial<Omit<EventsEditorAddingState, 'type'>>,
): EventsEditorAddingState => ({
    ...commonEventsEditorStateFactory(options),
    type: 'adding',
    event: options?.event ?? eventAndFrequencyFactory(),
});
