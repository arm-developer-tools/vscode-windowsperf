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

import 'jest';
import { updateRecentEvents } from './recent-events';
import { eventAndFrequencyFactory, recordOptionsFactory } from './wperf/record-options.factories';

describe('updateRecentEvents', () => {
    it('adds events from the record options to the recent events', () => {
        const got = updateRecentEvents(
            [],
            recordOptionsFactory({
                events: [
                    eventAndFrequencyFactory({ event: 'event1' }),
                    eventAndFrequencyFactory({ event: 'event2' }),
                ],
            }),
        );

        expect(got).toEqual(['event1', 'event2']);
    });

    it('does not store duplicate events', () => {
        const got = updateRecentEvents(
            ['event1'],
            recordOptionsFactory({
                events: [eventAndFrequencyFactory({ event: 'event1' })],
            }),
        );

        expect(got).toEqual(['event1']);
    });

    it('adds the new events to the front of the array', () => {
        const got = updateRecentEvents(
            ['event1', 'event2'],
            recordOptionsFactory({
                events: [eventAndFrequencyFactory({ event: 'event3' })],
            }),
        );

        expect(got).toEqual(['event3', 'event1', 'event2']);
    });

    it('removes the oldest when the maximum number of recent events is reached', () => {
        const got = updateRecentEvents(
            ['event1', 'event2', 'event3', 'event4', 'event5'],
            recordOptionsFactory({
                events: [
                    eventAndFrequencyFactory({ event: 'event6' }),
                    eventAndFrequencyFactory({ event: 'event7' }),
                ],
            }),
        );

        expect(got).toEqual(['event6', 'event7', 'event1', 'event2', 'event3']);
    });

    it('moves the event to the front of the list if it is already in the recent events', () => {
        const got = updateRecentEvents(
            ['event1', 'event2', 'event3'],
            recordOptionsFactory({
                events: [eventAndFrequencyFactory({ event: 'event2' })],
            }),
        );

        expect(got).toEqual(['event2', 'event1', 'event3']);
    });

    it('moves the event to the front of the list if it is already in the recent events and the list is at the maximum', () => {
        const got = updateRecentEvents(
            ['event1', 'event2', 'event3', 'event4', 'event5'],
            recordOptionsFactory({
                events: [eventAndFrequencyFactory({ event: 'event5' })],
            }),
        );

        expect(got).toEqual(['event5', 'event1', 'event2', 'event3', 'event4']);
    });
});
