/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { Dispatch, useMemo } from 'react';
import { PredefinedEvent } from '../../../../wperf/parse/list';
import { EventAndFrequency } from '../../../../wperf/record-options';
import { EventsEditorAction, EventsEditorState } from '../../state/events-editor';
import { UpdateRecordOption } from '../../update-record-option';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { UpdateRecordOptionAction } from '../../state/update-record-option-action';
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

type EventDropdownProps = {
    dispatch: Dispatch<EventsEditorAction>;
    eventData: EventData;
};

const EventDropdown = (props: EventDropdownProps) => {
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

export type EventEditRowProps = {
    dispatch: Dispatch<EventsEditorAction>;
    editorState: EventsEditorState;
    predefinedEvents: PredefinedEvent[];
    selectedEvents: EventAndFrequency[];
    recentEvents: string[];
    updateRecordOption: UpdateRecordOption;
};

export const EventEditRow = (props: EventEditRowProps) => {
    const editorState = props.editorState;

    const onAdd = () => {
        if (editorState.event.event) {
            const action: UpdateRecordOptionAction =
                editorState.type === 'adding'
                    ? { type: 'addEvent', event: editorState.event }
                    : { type: 'editEvent', index: editorState.index, event: editorState.event };
            props.updateRecordOption(action);
        }
    };

    const onCancel = () => {
        props.dispatch({ type: 'cancel' });
    };

    const onFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFrequency = Math.abs(parseInt(event.target.value, 10));

        props.dispatch({
            type: 'setFrequency',
            frequency: isNaN(newFrequency) ? undefined : newFrequency,
        });
    };

    return (
        <>
            <div className="event-edit-row">
                <EventDropdown
                    dispatch={props.dispatch}
                    eventData={{
                        dropdownValue: editorState.event.event,
                        predefinedEvents: props.predefinedEvents,
                        selectedEvents: props.selectedEvents.map(({ event }) => event),
                        recentEvents: props.recentEvents,
                    }}
                />
                <input
                    type="number"
                    aria-label="Frequency"
                    value={editorState.event.frequency ?? ''}
                    onChange={onFrequencyChange}
                    placeholder="Frequency"
                />
                <VSCodeButton onClick={onAdd}>
                    {editorState.type === 'adding' ? 'Add' : 'Save'}
                </VSCodeButton>
                <VSCodeButton onClick={onCancel} appearance="secondary">
                    {editorState.type === 'adding' ? 'Clear' : 'Cancel'}
                </VSCodeButton>
            </div>
        </>
    );
};
