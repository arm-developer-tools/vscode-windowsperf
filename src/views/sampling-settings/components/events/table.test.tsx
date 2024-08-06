/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import 'jest';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { eventAndFrequencyFactory } from '../../../../wperf/record-options.factories';
import { EventTable, EventTableProps } from './table';
import { EventsEditorAction } from '../../state/events-editor';
import { UpdateRecordOptionAction } from '../../state/update-record-option-action';
import { predefinedEventFactory } from '../../../../wperf/parse/list.factories';

const eventTablePropsFactory = (options?: Partial<EventTableProps>): EventTableProps => ({
    dispatch: options?.dispatch ?? jest.fn(),
    updateRecordOption: options?.updateRecordOption ?? jest.fn(),
    editingEventIndex: options?.editingEventIndex,
    predefinedEvents: options?.predefinedEvents ?? [predefinedEventFactory()],
    selectedEvents: options?.selectedEvents ?? [],
});

describe('EventTable', () => {
    it('renders no rows when the selectedEvents array is empty', () => {
        render(<EventTable {...eventTablePropsFactory({ selectedEvents: [] })} />);

        const allListItems = screen.queryAllByRole('listitem');
        expect(allListItems).toHaveLength(0);
    });

    it('shows a row for each selected event', () => {
        const selectedEvents = [
            eventAndFrequencyFactory({ event: 'event_1' }),
            eventAndFrequencyFactory({ event: 'event_2' }),
        ];

        render(<EventTable {...eventTablePropsFactory({ selectedEvents })} />);

        expect(screen.getByText('event_1')).toBeInTheDocument();
        expect(screen.getByText('event_2')).toBeInTheDocument();
    });

    it('sorts events by name', () => {
        const selectedEvents = [
            eventAndFrequencyFactory({ event: 'Second Event' }),
            eventAndFrequencyFactory({ event: 'First Event' }),
        ];

        render(<EventTable {...eventTablePropsFactory({ selectedEvents })} />);

        const allListItems = screen.getAllByRole('listitem');
        expect(allListItems).toHaveLength(2);
        expect(allListItems[0]).toHaveTextContent('First Event');
        expect(allListItems[1]).toHaveTextContent('Second Event');
    });

    it('shows the description of the event in the table', () => {
        const eventName = 'test_event';
        const description = 'Test description';
        const selectedEvents = [eventAndFrequencyFactory({ event: eventName })];
        const predefinedEvents = [
            predefinedEventFactory({ Alias_Name: eventName, Description: description }),
        ];

        render(<EventTable {...eventTablePropsFactory({ predefinedEvents, selectedEvents })} />);

        expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('does not show events that are currently being edited', () => {
        const selectedEvents = [
            eventAndFrequencyFactory({ event: 'event_1' }),
            eventAndFrequencyFactory({ event: 'event_2' }),
        ];

        render(
            <EventTable {...eventTablePropsFactory({ editingEventIndex: 0, selectedEvents })} />,
        );

        expect(screen.queryByText('event_1')).not.toBeInTheDocument();
        expect(screen.queryByText('event_2')).toBeInTheDocument();
    });

    it('dispatches a startEditing action when an edit button is clicked', () => {
        const dispatch = jest.fn();
        const selectedEvents = [eventAndFrequencyFactory({ event: 'event_1' })];
        render(<EventTable {...eventTablePropsFactory({ dispatch, selectedEvents })} />);

        fireEvent.click(screen.getByLabelText('Edit'));

        const want: EventsEditorAction = { type: 'startEditing', index: 0 };
        expect(dispatch).toHaveBeenCalledWith(want);
    });

    it('calls updateRecordOptions when a remove button is clicked', () => {
        const updateRecordOption = jest.fn();
        const selectedEvents = [eventAndFrequencyFactory({ event: 'event_1' })];
        render(<EventTable {...eventTablePropsFactory({ updateRecordOption, selectedEvents })} />);

        fireEvent.click(screen.getByLabelText('Remove'));

        const want: UpdateRecordOptionAction = { type: 'removeEvent', index: 0 };
        expect(updateRecordOption).toHaveBeenCalledWith(want);
    });
});
