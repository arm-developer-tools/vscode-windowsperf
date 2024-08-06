/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import '@testing-library/jest-dom';
import { PredefinedEvent } from '../../../../wperf/parse/list';
import { predefinedEventFactory } from '../../../../wperf/parse/list.factories';
import { createDropdownOptions } from './dropdown';

describe('createDropdownOptions', () => {
    it('only returns the Events group when there are no recent events, containing every predefined event', () => {
        const predefinedEvents: PredefinedEvent[] = [
            predefinedEventFactory({ Alias_Name: 'Event 1' }),
            predefinedEventFactory({ Alias_Name: 'Event 2' }),
        ];

        const got = createDropdownOptions({
            dropdownValue: '',
            predefinedEvents,
            recentEvents: [],
            selectedEvents: [],
        });

        expect(got).toEqual([
            {
                label: 'Events',
                options: predefinedEvents,
            },
        ]);
    });

    it('returns the Events and Recent groups when there are recent events, without duplicating recent events', () => {
        const otherPredefinedEvents: PredefinedEvent[] = [
            predefinedEventFactory({ Alias_Name: 'Event 1' }),
            predefinedEventFactory({ Alias_Name: 'Event 2' }),
        ];
        const recentPredefinedEvents: PredefinedEvent[] = [
            predefinedEventFactory({ Alias_Name: 'Event 3' }),
        ];
        const recentEvents = ['Event 3'];

        const got = createDropdownOptions({
            dropdownValue: '',
            predefinedEvents: [...otherPredefinedEvents, ...recentPredefinedEvents],
            selectedEvents: [],
            recentEvents,
        });

        expect(got).toEqual([
            { label: 'Recent', options: recentPredefinedEvents },
            { label: 'Events', options: otherPredefinedEvents },
        ]);
    });

    it('sorts both groups by alias name', () => {
        const recentPredefinedEvents: PredefinedEvent[] = [
            predefinedEventFactory({ Alias_Name: 'Second Recent Event' }),
            predefinedEventFactory({ Alias_Name: 'First Recent Event' }),
        ];
        const otherPredefinedEvents: PredefinedEvent[] = [
            predefinedEventFactory({ Alias_Name: 'Second Event' }),
            predefinedEventFactory({ Alias_Name: 'First Event' }),
        ];

        const got = createDropdownOptions({
            dropdownValue: '',
            predefinedEvents: [...recentPredefinedEvents, ...otherPredefinedEvents],
            selectedEvents: [],
            recentEvents: ['Second Recent Event', 'First Recent Event'],
        });

        expect(got).toEqual([
            { label: 'Recent', options: [recentPredefinedEvents[1], recentPredefinedEvents[0]] },
            { label: 'Events', options: [otherPredefinedEvents[1], otherPredefinedEvents[0]] },
        ]);
    });

    it('does not return selected events in either group', () => {
        const selectedRecentEventAlias = 'Selected Recent Event';
        const otherRecentEventAlias = 'Other Recent Event';
        const selectedOtherEventAlias = 'Selected Event';
        const otherOtherEventAlias = 'Other Other Event';
        const otherOtherPredefinedEvent = predefinedEventFactory({
            Alias_Name: otherOtherEventAlias,
        });
        const otherRecentPredefinedEvent = predefinedEventFactory({
            Alias_Name: otherRecentEventAlias,
        });
        const recentPredefinedEvents: PredefinedEvent[] = [
            otherRecentPredefinedEvent,
            predefinedEventFactory({ Alias_Name: selectedRecentEventAlias }),
        ];
        const otherPredefinedEvents: PredefinedEvent[] = [
            predefinedEventFactory({ Alias_Name: selectedOtherEventAlias }),
            otherOtherPredefinedEvent,
        ];

        const got = createDropdownOptions({
            dropdownValue: '',
            predefinedEvents: [...recentPredefinedEvents, ...otherPredefinedEvents],
            selectedEvents: [selectedRecentEventAlias, selectedOtherEventAlias],
            recentEvents: [selectedRecentEventAlias, otherRecentEventAlias],
        });

        expect(got).toEqual([
            { label: 'Recent', options: [otherRecentPredefinedEvent] },
            { label: 'Events', options: [otherOtherPredefinedEvent] },
        ]);
    });

    it('returns the event currently in the dropdown, even if it is selected', () => {
        const selectedEventAlias = 'Selected Event';
        const selectedPredefinedEvent = predefinedEventFactory({ Alias_Name: selectedEventAlias });

        const got = createDropdownOptions({
            dropdownValue: selectedEventAlias,
            predefinedEvents: [selectedPredefinedEvent],
            selectedEvents: [selectedEventAlias],
            recentEvents: [],
        });

        expect(got).toEqual([{ label: 'Events', options: [selectedPredefinedEvent] }]);
    });
});
