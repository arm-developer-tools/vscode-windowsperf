/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { EventAndFrequency } from '../../../../wperf/record-options';
import { UpdateRecordOption } from '../../update-record-option';
import { PredefinedEvent } from '../../../../wperf/parse/list';

type RowActionProps = { onClick: () => void; icon: string; label: string };

const RowAction = (props: RowActionProps) => (
    <div role="button" className="row-action" title={props.label} onClick={props.onClick}>
        <span aria-label={props.label} className={`codicon codicon-${props.icon}`} />
    </div>
);

type EventRowProps = {
    updateRecordOption: UpdateRecordOption;
    event: EventAndFrequency;
    index: number;
    predefinedEvents: PredefinedEvent[];
};

const EventRow = ({ event, index, predefinedEvents, updateRecordOption }: EventRowProps) => {
    const description = predefinedEvents.find(
        (predefinedEvent) => predefinedEvent.Alias_Name === event.event,
    )?.Description;

    const onRemove = () => {
        updateRecordOption({ type: 'removeEvent', index });
    };

    const onEdit = () => {
        console.log('onEdit', index);
    };

    return (
        <div className="row" role="listitem">
            <div title={description}>
                <div className="event-name">{event.event}</div>
                <div className="event-description">{description}</div>
            </div>
            <div>{event.frequency}</div>
            <div className="row-actions">
                <RowAction icon="pencil" onClick={onEdit} label="Edit" />
                <RowAction icon="remove-close" onClick={onRemove} label="Remove" />
            </div>
        </div>
    );
};

export type EventTableProps = {
    updateRecordOption: UpdateRecordOption;
    predefinedEvents: PredefinedEvent[];
    selectedEvents: EventAndFrequency[];
};

export const EventTable = (props: EventTableProps) => {
    const visibleSortedEventsAndIndices = props.selectedEvents
        .map((event, index) => ({ event, index }))
        .sort((a, b) => a.event.event.localeCompare(b.event.event));

    const baseRowProps: Pick<EventRowProps, 'predefinedEvents' | 'updateRecordOption'> = {
        predefinedEvents: props.predefinedEvents,
        updateRecordOption: props.updateRecordOption,
    };

    const eventRows = visibleSortedEventsAndIndices.map(({ event, index }) => (
        <EventRow {...baseRowProps} key={event.event} event={event} index={index} />
    ));

    return (
        <div className="event-table" role="list">
            <div className="row header">
                <div>Event</div>
                <div>Frequency</div>
            </div>
            {eventRows}
        </div>
    );
};
