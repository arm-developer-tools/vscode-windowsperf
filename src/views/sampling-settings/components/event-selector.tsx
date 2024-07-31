/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { PredefinedEvent } from '../../../wperf/parse/list';
import { RecordOptions } from '../../../wperf/record-options';
import { UpdateRecordOption } from '../update-record-option';
import { UpdateRecordOptionAction } from '../state/update-record-option-action';

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
    const index = recordOptions.events.findIndex(
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
