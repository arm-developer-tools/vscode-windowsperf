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

import { eventAndFrequencyFactory } from '../../../wperf/record-options.factories';
import { EventsEditorAddingState, EventsEditorEditingState } from './events-editor';

const commonEventsEditorStateFactory = (
    options?: Partial<Pick<EventsEditorAddingState, 'event' | 'validate'>>,
): Pick<EventsEditorAddingState, 'event' | 'validate'> => {
    return {
        event: eventAndFrequencyFactory(),
        validate: false,
        ...options,
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
