/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { Dispatch } from 'react';
import { PredefinedEvent } from '../../../../wperf/parse/list';
import { EventAndFrequency } from '../../../../wperf/record-options';
import { EventsEditorAction, EventsEditorState } from '../../state/events-editor';
import { UpdateRecordOption } from '../../update-record-option';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { UpdateRecordOptionAction } from '../../state/update-record-option-action';
import { EventDropdown } from './dropdown';

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
