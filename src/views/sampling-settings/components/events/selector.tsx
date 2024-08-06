/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { PredefinedEvent } from '../../../../wperf/parse/list';
import { EventAndFrequency } from '../../../../wperf/record-options';
import { UpdateRecordOption } from '../../update-record-option';
import { Dispatch } from 'react';
import { EventsEditorAction, EventsEditorState } from '../../state/events-editor';
import { EventTable } from './table';
import { EventEditRow } from './edit-row';

export type EventSelectorProps = {
    dispatch: Dispatch<EventsEditorAction>;
    editorState: EventsEditorState;
    predefinedEvents: PredefinedEvent[];
    selectedEvents: EventAndFrequency[];
    recentEvents: string[];
    updateRecordOption: UpdateRecordOption;
};

export const EventSelector = (props: EventSelectorProps) => {
    return (
        <>
            <EventTable
                updateRecordOption={props.updateRecordOption}
                predefinedEvents={props.predefinedEvents}
                selectedEvents={props.selectedEvents}
            />
            <EventEditRow
                dispatch={props.dispatch}
                editorState={props.editorState}
                predefinedEvents={props.predefinedEvents}
                selectedEvents={props.selectedEvents}
                recentEvents={props.recentEvents}
                updateRecordOption={props.updateRecordOption}
            />
        </>
    );
};
