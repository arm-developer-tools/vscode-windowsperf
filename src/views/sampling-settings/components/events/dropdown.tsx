/**
 * Copyright 2024 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
    showInvalidEvent: boolean;
    className?: string;
};

export const EventDropdown = (props: EventDropdownProps) => {
    const optionGroups = useMemo(() => createDropdownOptions(props.eventData), [props.eventData]);

    const onEventChange = (newEvent: string) => {
        props.dispatch({ type: 'setEventName', event: newEvent });
    };

    return (
        <Dropdown
            className={props.className}
            value={props.eventData.dropdownValue}
            invalid={props.showInvalidEvent}
            onChange={onEventChange}
            panelClassName="event-dropdown-panel"
            options={optionGroups}
            placeholder="Event"
            optionLabel="Alias_Name"
            optionValue="Alias_Name"
            filter
            filterInputAutoFocus
            filterBy="Alias_Name,Description"
            filterPlaceholder="Enter keywords to search for events"
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
