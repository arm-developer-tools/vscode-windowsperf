/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { recordOptionsFactory } from '../../../wperf/record-options.factories';
import { EventSelector } from './event-selector';
import { predefinedEventFactory } from '../../../wperf/parse/list.factories';
import { UpdateRecordOptionAction } from '../reducer';

describe('EventSelector', () => {
    it('renders each event as a checkbox', () => {
        render(
            <EventSelector
                events={[
                    predefinedEventFactory({ Alias_Name: 'event_1' }),
                    predefinedEventFactory({ Alias_Name: 'event_2' }),
                ]}
                recordOptions={recordOptionsFactory()}
                updateRecordOption={jest.fn()}
            />,
        );

        expect(screen.queryByText('event_1')).toBeInTheDocument();
        expect(screen.queryByText('event_2')).toBeInTheDocument();
    });

    it('sorts events by Alias_Name', () => {
        const { container } = render(
            <EventSelector
                events={[
                    predefinedEventFactory({ Alias_Name: 'event_b' }),
                    predefinedEventFactory({ Alias_Name: 'event_a' }),
                    predefinedEventFactory({ Alias_Name: 'event_c' }),
                ]}
                recordOptions={recordOptionsFactory()}
                updateRecordOption={jest.fn()}
            />,
        );

        const labels = container.querySelectorAll('label');
        expect(labels[0]).toHaveTextContent('event_a');
        expect(labels[1]).toHaveTextContent('event_b');
        expect(labels[2]).toHaveTextContent('event_c');
    });

    it('checks checkboxes for events in recordOptions.events', () => {
        render(
            <EventSelector
                events={[
                    predefinedEventFactory({ Alias_Name: 'event_1' }),
                    predefinedEventFactory({ Alias_Name: 'event_2' }),
                ]}
                recordOptions={recordOptionsFactory({ events: ['event_1'] })}
                updateRecordOption={jest.fn()}
            />,
        );

        expect(screen.getByLabelText('event_1')).toBeChecked();
        expect(screen.getByLabelText('event_2')).not.toBeChecked();
    });

    it('calls updateRecordOption when a checkbox is checked', () => {
        const updateRecordOption = jest.fn();
        render(
            <EventSelector
                events={[
                    predefinedEventFactory({ Alias_Name: 'event_1' }),
                    predefinedEventFactory({ Alias_Name: 'event_2' }),
                ]}
                recordOptions={recordOptionsFactory({ events: ['event_1'] })}
                updateRecordOption={updateRecordOption}
            />,
        );

        fireEvent.click(screen.getByText('event_2'));

        const want: UpdateRecordOptionAction = { type: 'addEvent', event: 'event_2' };
        expect(updateRecordOption).toHaveBeenCalledWith(want);
    });

    it('calls updateRecordOption when a checkbox is unchecked', () => {
        const updateRecordOption = jest.fn();
        render(
            <EventSelector
                events={[
                    predefinedEventFactory({ Alias_Name: 'event_1' }),
                    predefinedEventFactory({ Alias_Name: 'event_2' }),
                ]}
                recordOptions={recordOptionsFactory({ events: ['event_1'] })}
                updateRecordOption={updateRecordOption}
            />,
        );

        fireEvent.click(screen.getByText('event_1'));

        const want: UpdateRecordOptionAction = { type: 'removeEvent', event: 'event_1' };
        expect(updateRecordOption).toHaveBeenCalledWith(want);
    });
});
