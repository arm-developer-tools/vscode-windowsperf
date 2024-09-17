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
import { Dispatch } from 'react';
import { EventAndFrequency } from '../../../../wperf/record-options';
import { EventsEditorAction } from '../../state/events-editor';
import { UpdateRecordOption } from '../../update-record-option';
import { PredefinedEvent } from '../../../../wperf/parse/list';
import { FormattedNumber } from '../../../common/components/formatted-number';
import { formatNumber } from '../../../../math';

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
    defaultFrequency: number;
};

const EventRow = ({
    dispatch,
    event,
    index,
    predefinedEvents,
    updateRecordOption,
    defaultFrequency,
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
                <p className="event-name no-margin">{event.event}</p>
                <p className="event-description no-margin">{description}</p>
            </div>
            {event.frequency ? (
                <FormattedNumber value={event.frequency} />
            ) : (
                <span className="event-table-default">
                    Using default {`(${formatNumber(defaultFrequency)})`}
                </span>
            )}
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
    defaultFrequency: number;
};

export const EventTable = (props: EventTableProps) => {
    const visibleSortedEventsAndIndices = props.selectedEvents
        .map((event, index) => ({ event, index }))
        .filter(({ index }) => index !== props.editingEventIndex)
        .sort((a, b) => a.event.event.localeCompare(b.event.event));

    return (
        <div className="event-table" role="list">
            <div className="row header">
                <div>Event</div>
                <div>
                    Frequency
                    <span
                        className="codicon codicon-info information-tooltip"
                        title={`Number of times an event must occur to be counted as a "hit". \
Default value is set by the system (${formatNumber(props.defaultFrequency)}).`}
                    ></span>
                </div>
            </div>
            {getEventRows(visibleSortedEventsAndIndices, props)}
        </div>
    );
};

const getEventRows = (
    visibleSortedEventsAndIndices: { event: EventAndFrequency; index: number }[],
    { dispatch, predefinedEvents, updateRecordOption, defaultFrequency }: EventTableProps,
) => {
    const baseRowProps: Pick<
        EventRowProps,
        'predefinedEvents' | 'updateRecordOption' | 'dispatch'
    > = { dispatch, predefinedEvents, updateRecordOption };

    return visibleSortedEventsAndIndices.map(({ event, index }) => (
        <EventRow
            {...baseRowProps}
            key={event.event}
            event={event}
            index={index}
            defaultFrequency={defaultFrequency}
        />
    ));
};
