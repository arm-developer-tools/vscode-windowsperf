/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { UpdateRecordOptionAction } from '../../state/update-record-option-action';
import { EventDropdown } from './dropdown';
import { formatNumber } from '../../../../math';
import { EventSelectorProps } from './selector';

const ValidationMessage = (props: { message: string | undefined; show: boolean }) => {
    return (
        <div className="event-edit-row-validation-message">
            {props.message && props.show ? (
                <>
                    <span className="codicon codicon-error" /> {props.message}
                </>
            ) : undefined}
        </div>
    );
};

export type EventEditRowProps = EventSelectorProps;

export const EventEditRow = (props: EventEditRowProps) => {
    const editorState = props.editorState;
    const isEditorStateAdding = editorState.type === 'adding';
    const { availableGpcCount, samplingIntervalDefault } = props.testResults;

    const validationMessage =
        isEditorStateAdding && props.selectedEvents.length >= availableGpcCount
            ? `You can only sample ${availableGpcCount} events at once`
            : !editorState.event.event
              ? 'Please select an event'
              : undefined;

    const onAdd = () => {
        if (validationMessage) {
            props.dispatch({
                type: 'validate',
            });
        } else {
            const action: UpdateRecordOptionAction = isEditorStateAdding
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

    let frequencyWarning = undefined;
    const exceedsMaxFrequencyWarning = 'Exceeds the maximum frequency supported by WindowsPerf';

    const MAX_FREQUENCY_VALUE = 4294967295;

    if (
        props.editorState.event.frequency !== undefined &&
        props.editorState.event.frequency > MAX_FREQUENCY_VALUE
    ) {
        frequencyWarning = exceedsMaxFrequencyWarning;
    }

    return (
        <>
            <div className="event-edit-row">
                <EventDropdown
                    showInvalidEvent={editorState.validate}
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
                    placeholder={`${formatNumber(samplingIntervalDefault)} (default)`}
                />
                <VSCodeButton onClick={onAdd}>
                    {editorState.type === 'adding' ? 'Add' : 'Save'}
                </VSCodeButton>
                <VSCodeButton onClick={onCancel} appearance="secondary">
                    {editorState.type === 'adding' ? 'Clear' : 'Cancel'}
                </VSCodeButton>
            </div>
            <ValidationMessage message={validationMessage} show={editorState.validate} />
            {frequencyWarning && (
                <div className="warning-message">
                    <span className="codicon codicon-warning" />
                    {frequencyWarning}
                </div>
            )}
        </>
    );
};
