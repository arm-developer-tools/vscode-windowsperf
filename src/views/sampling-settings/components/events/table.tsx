/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { Dispatch } from 'react';
import { EventAndFrequency } from '../../../../wperf/record-options';
import { EventsEditorAction } from '../../state/events-editor';
import { UpdateRecordOption } from '../../update-record-option';
import { PredefinedEvent } from '../../../../wperf/parse/list';
import { FormattedNumber } from '../../../common/components/formatted-number';

type RowActionProps = { onClick: () => void; icon: string; label: string };

const RowAction = (props: RowActionProps) => (
    <div role="button" className="row-action" title={props.label} onClick={props.onClick}>
        <span aria-label={props.label} className={`codicon codicon-${props.icon}`} />
    </div>
);

type EventRowProps = {
    dispatch: Dispatch<EventsEditorAction>;
    updateRecordOption: UpdateRecordOption;
    event: EventAndFrequency;
    index: number;
    predefinedEvents: PredefinedEvent[];
};

const EventRow = ({
    dispatch,
    event,
    index,
    predefinedEvents,
    updateRecordOption,
}: EventRowProps) => {
    const description = predefinedEvents.find(
        (predefinedEvent) => predefinedEvent.Alias_Name === event.event,
    )?.Description;

    const onRemove = () => {
        updateRecordOption({ type: 'removeEvent', index });
    };

    const onEdit = () => {
        dispatch({ type: 'startEditing', index });
    };

    return (
        <div className="row" role="listitem">
            <div title={description}>
                <p className="event-name">{event.event}</p>
                <p className="event-description">{description}</p>
            </div>
            {event.frequency !== undefined && <FormattedNumber value={event.frequency} />}
            <div className="row-actions">
                <RowAction icon="pencil" onClick={onEdit} label="Edit" />
                <RowAction icon="remove-close" onClick={onRemove} label="Remove" />
            </div>
        </div>
    );
};

export type EventTableProps = {
    dispatch: Dispatch<EventsEditorAction>;
    updateRecordOption: UpdateRecordOption;
    predefinedEvents: PredefinedEvent[];
    selectedEvents: EventAndFrequency[];
    editingEventIndex: number | undefined;
};

export const EventTable = (props: EventTableProps) => {
    const visibleSortedEventsAndIndices = props.selectedEvents
        .map((event, index) => ({ event, index }))
        .filter(({ index }) => index !== props.editingEventIndex)
        .sort((a, b) => a.event.event.localeCompare(b.event.event));

    const baseRowProps: Pick<
        EventRowProps,
        'predefinedEvents' | 'updateRecordOption' | 'dispatch'
    > = {
        dispatch: props.dispatch,
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
