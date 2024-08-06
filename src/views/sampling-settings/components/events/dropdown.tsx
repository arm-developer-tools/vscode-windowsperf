/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { Dispatch, useMemo } from 'react';
import { PredefinedEvent } from '../../../../wperf/parse/list';
import { EventsEditorAction } from '../../state/events-editor';
import { Dropdown, OptionGroup } from '../../../common/components/dropdown';

const comparePredefinedEvents = (a: PredefinedEvent, b: PredefinedEvent) =>
    a.Alias_Name.localeCompare(b.Alias_Name);

export type EventData = {
    dropdownValue: string;
    predefinedEvents: PredefinedEvent[];
    selectedEvents: string[];
    recentEvents: string[];
};

type GroupedEvents = { recent: PredefinedEvent[]; other: PredefinedEvent[] };

const groupAndFilterEvents = (data: EventData): GroupedEvents => {
    const recent: PredefinedEvent[] = [];
    const other: PredefinedEvent[] = [];

    for (const predefinedEvent of data.predefinedEvents) {
        const isInEditorState = predefinedEvent.Alias_Name === data.dropdownValue;
        const isSelectedEvent = data.selectedEvents.some(
            (selectedEvent) => selectedEvent === predefinedEvent.Alias_Name,
        );

        if (isInEditorState || !isSelectedEvent) {
            if (data.recentEvents.includes(predefinedEvent.Alias_Name)) {
                recent.push(predefinedEvent);
            } else {
                other.push(predefinedEvent);
            }
        }
    }

    return { recent, other };
};

export const createDropdownOptions = (data: EventData): OptionGroup<PredefinedEvent>[] => {
    const { recent: recentEventsOptions, other: otherEventsOptions } = groupAndFilterEvents(data);

    const eventsOptionsGroup: OptionGroup<PredefinedEvent> = {
        label: 'Events',
        options: otherEventsOptions.toSorted(comparePredefinedEvents),
    };

    if (recentEventsOptions.length === 0) {
        return [eventsOptionsGroup];
    } else {
        return [
            {
                label: 'Recent',
                options: recentEventsOptions.toSorted(comparePredefinedEvents),
            },
            eventsOptionsGroup,
        ];
    }
};

export type EventDropdownProps = {
    dispatch: Dispatch<Extract<EventsEditorAction, { type: 'setEventName' }>>;
    eventData: EventData;
};

export const EventDropdown = (props: EventDropdownProps) => {
    const optionGroups = useMemo(() => createDropdownOptions(props.eventData), [props.eventData]);

    const onEventChange = (newEvent: string) => {
        props.dispatch({ type: 'setEventName', event: newEvent });
    };

    return (
        <Dropdown
            value={props.eventData.dropdownValue}
            onChange={onEventChange}
            panelClassName="event-dropdown-panel"
            options={optionGroups}
            placeholder="Event"
            optionLabel="Alias_Name"
            optionValue="Alias_Name"
            filter
            filterInputAutoFocus
            filterBy="Alias_Name,Description"
            scrollHeight="400px"
            itemTemplate={(option: PredefinedEvent) => (
                <>
                    <div className="event-dropdown-item-header" title={option.Description}>
                        {option.Alias_Name}
                    </div>
                    <div className="event-dropdown-item-detail" title={option.Description}>
                        {option.Description}
                    </div>
                </>
            )}
        />
    );
};
