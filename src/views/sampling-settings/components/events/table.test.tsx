/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import 'jest';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { eventAndFrequencyFactory } from '../../../../wperf/record-options.factories';
import { EventTable, EventTableProps } from './table';
import { UpdateRecordOptionAction } from '../../state/update-record-option-action';
import { predefinedEventFactory } from '../../../../wperf/parse/list.factories';

const eventTablePropsFactory = (options?: Partial<EventTableProps>): EventTableProps => ({
    updateRecordOption: options?.updateRecordOption ?? jest.fn(),
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

    it('shows the description of the event in a tooltip', () => {
        const eventName = 'test_event';
        const description = 'Test description';
        const selectedEvents = [eventAndFrequencyFactory({ event: eventName })];
        const predefinedEvents = [
            predefinedEventFactory({ Alias_Name: eventName, Description: description }),
        ];

        render(<EventTable {...eventTablePropsFactory({ predefinedEvents, selectedEvents })} />);

        expect(screen.getByRole('listitem')).toHaveAttribute('title', description);
    });

    it('starts editing when the edit button is clicked', () => {
        const selectedEvents = [eventAndFrequencyFactory({ event: 'event_1' })];
        render(<EventTable {...eventTablePropsFactory({ selectedEvents })} />);

        fireEvent.click(screen.getByLabelText('Edit'));
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
