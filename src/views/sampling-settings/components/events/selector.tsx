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
import { TestResults } from '../../../../wperf/parse/test';

export type EventSelectorProps = {
    dispatch: Dispatch<EventsEditorAction>;
    editorState: EventsEditorState;
    predefinedEvents: PredefinedEvent[];
    selectedEvents: EventAndFrequency[];
    recentEvents: string[];
    testResults: TestResults;
    updateRecordOption: UpdateRecordOption;
};

export const EventSelector = (props: EventSelectorProps) => {
    return (
        <>
            <EventTable
                editingEventIndex={
                    props.editorState.type === 'editing' ? props.editorState.index : undefined
                }
                dispatch={props.dispatch}
                updateRecordOption={props.updateRecordOption}
                predefinedEvents={props.predefinedEvents}
                selectedEvents={props.selectedEvents}
                defaultFrequency={props.testResults.samplingIntervalDefault}
            />
            <EventEditRow {...props} />
        </>
    );
};
