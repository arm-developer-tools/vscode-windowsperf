/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { PredefinedEvent } from '../../../wperf/parse/list';
import { RecordOptions } from '../../../wperf/record-options';
import { UpdateRecordOption } from '../update-record-option';

export type EventSelectorProps = {
    events: PredefinedEvent[];
    recordOptions: RecordOptions;
    updateRecordOption: UpdateRecordOption;
};

type EventListItemProps = {
    event: PredefinedEvent;
    recordOptions: RecordOptions;
    updateRecordOption: UpdateRecordOption;
};

const EventListItem = ({ event, recordOptions, updateRecordOption }: EventListItemProps) => {
    const checked = recordOptions.events.some(
        ({ event: selectedEvent }) => selectedEvent === event.Alias_Name,
    );

    const onChange = () => {
        updateRecordOption({ type: checked ? 'removeEvent' : 'addEvent', event: event.Alias_Name });
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

export const EventSelector = (props: EventSelectorProps) => {
    const sortedEvents = props.events.sort((a, b) => a.Alias_Name.localeCompare(b.Alias_Name));

    return (
        <ul className="event-selector">
            {sortedEvents.map((event) => (
                <EventListItem event={event} key={event.Alias_Name} {...props} />
            ))}
        </ul>
    );
};
