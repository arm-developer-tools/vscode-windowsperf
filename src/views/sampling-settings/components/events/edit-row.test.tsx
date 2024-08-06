/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import 'jest';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { EventsEditorAction } from '../../state/events-editor';
import { createDropdownOptions, EventEditRow, EventEditRowProps } from './edit-row';
import { PredefinedEvent } from '../../../../wperf/parse/list';
import { eventAndFrequencyFactory } from '../../../../wperf/record-options.factories';
import { predefinedEventFactory } from '../../../../wperf/parse/list.factories';
import { faker } from '@faker-js/faker';
import { eventsEditorStateFactory } from '../../state/events-editor.factories';

const eventEditRowPropsFactory = (options?: Partial<EventEditRowProps>): EventEditRowProps => ({
    dispatch: options?.dispatch ?? jest.fn(),
    editorState: options?.editorState ?? eventsEditorStateFactory(),
    predefinedEvents: options?.predefinedEvents ?? [],
    selectedEvents: options?.selectedEvents ?? [],
    updateRecordOption: options?.updateRecordOption ?? jest.fn(),
    recentEvents: options?.recentEvents ?? [faker.word.noun()],
});

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

describe('EventEditRow', () => {
    it('renders Add and Clear buttons', () => {
        const editorState = eventsEditorStateFactory();

        render(<EventEditRow {...eventEditRowPropsFactory({ editorState })} />);

        expect(screen.getByText('Add')).toBeInTheDocument();
        expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('dispatches a cancel action when the Clear button is clicked', () => {
        const dispatch = jest.fn();
        const editorState = eventsEditorStateFactory();
        render(<EventEditRow {...eventEditRowPropsFactory({ dispatch, editorState })} />);

        fireEvent.click(screen.getByText('Clear'));

        const want: EventsEditorAction = { type: 'cancel' };
        expect(dispatch).toHaveBeenCalledWith(want);
    });

    it('shows the currently selected frequency in the frequency input', () => {
        const editorState = eventsEditorStateFactory({
            event: eventAndFrequencyFactory({ frequency: 42 }),
        });

        render(<EventEditRow {...eventEditRowPropsFactory({ editorState })} />);

        expect(screen.getByPlaceholderText('Frequency')).toHaveValue(42);
    });

    it('dispatches a setFrequency action when the frequency input changes', () => {
        const dispatch = jest.fn();
        const editorState = eventsEditorStateFactory();
        render(<EventEditRow {...eventEditRowPropsFactory({ dispatch, editorState })} />);

        fireEvent.change(screen.getByPlaceholderText('Frequency'), { target: { value: '42' } });

        const want: EventsEditorAction = { type: 'setFrequency', frequency: 42 };
        expect(dispatch).toHaveBeenCalledWith(want);
    });
});
