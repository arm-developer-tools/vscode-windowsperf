/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { PredefinedEvent } from '../../../../wperf/parse/list';
import { EventAndFrequency } from '../../../../wperf/record-options';
import { UpdateRecordOption } from '../../update-record-option';
import { EventTable } from './table';
import { UpdateRecordOptionAction } from '../../state/update-record-option-action';

export type EventSelectorProps = {
    predefinedEvents: PredefinedEvent[];
    selectedEvents: EventAndFrequency[];
    updateRecordOption: UpdateRecordOption;
};

type CheckboxItemProps = {
    event: PredefinedEvent;
    selectedEvents: EventAndFrequency[];
    updateRecordOption: UpdateRecordOption;
};

const CheckboxItem = ({ event, selectedEvents, updateRecordOption }: CheckboxItemProps) => {
    const index = selectedEvents.findIndex(
        ({ event: selectedEvent }) => selectedEvent === event.Alias_Name,
    );

    const checked = index >= 0;

    const onChange = () => {
        const action: UpdateRecordOptionAction = checked
            ? { type: 'removeEvent', index }
            : { type: 'addEvent', event: { event: event.Alias_Name, frequency: undefined } };
        updateRecordOption(action);
    };

    return (
        <li title={event.Description}>
            <label className="checkbox">
                <input
                    type="checkbox"
                    value={event.Alias_Name}
                    checked={checked}
                    onChange={onChange}
                />
                {event.Alias_Name}
            </label>
        </li>
    );
};

const CheckboxList = (props: EventSelectorProps) => {
    const sortedEvents = props.predefinedEvents.sort((a, b) =>
        a.Alias_Name.localeCompare(b.Alias_Name),
    );

    return (
        <ul className="event-selector">
            {sortedEvents.map((event) => (
                <CheckboxItem event={event} key={event.Alias_Name} {...props} />
            ))}
        </ul>
    );
};

export const EventSelector = (props: EventSelectorProps) => {
    return (
        <>
            <EventTable
                updateRecordOption={props.updateRecordOption}
                predefinedEvents={props.predefinedEvents}
                selectedEvents={props.selectedEvents}
            />
            <CheckboxList
                predefinedEvents={props.predefinedEvents}
                selectedEvents={props.selectedEvents}
                updateRecordOption={props.updateRecordOption}
            />
        </>
    );
};
