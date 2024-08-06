/**
 * Copyright (C) 2024 Arm Limited
 */

import { eventAndFrequencyFactory } from '../../../wperf/record-options.factories';
import { EventsEditorState } from './events-editor';

export const eventsEditorStateFactory = (
    options?: Partial<Omit<EventsEditorState, 'type'>>,
): EventsEditorState => ({
    event: options?.event ?? eventAndFrequencyFactory(),
});
