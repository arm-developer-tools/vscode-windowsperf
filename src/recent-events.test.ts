/**
 * Copyright (C) 2024 Arm Limited
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
