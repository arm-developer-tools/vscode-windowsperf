/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { UpdateRecordOptionAction } from '../../state/update-record-option-action';
import { EventDropdown } from './dropdown';
import { formatNumber } from '../../../../math';
import { EventSelectorProps } from './selector';

const ValidationMessage = (props: { showMissingEventValidation: boolean }) => {
    return (
        <div className={`event-edit-row-validation-message`}>
            {props.showMissingEventValidation ? (
                <>
                    <span className={`codicon codicon-error`} /> Please select an event
                </>
            ) : undefined}
        </div>
    );
};

export type EventEditRowProps = EventSelectorProps;

export const EventEditRow = (props: EventEditRowProps) => {
    const editorState = props.editorState;

    const onAdd = () => {
        if (editorState.event.event) {
            const action: UpdateRecordOptionAction =
                editorState.type === 'adding'
                    ? { type: 'addEvent', event: editorState.event }
                    : { type: 'editEvent', index: editorState.index, event: editorState.event };
            props.updateRecordOption(action);
        } else {
            props.dispatch({ type: 'validateMissingFields' });
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

    const showMissingEventValidation =
        editorState.validateMissingFields && !editorState.event.event;

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
                    showInvalidEvent={showMissingEventValidation}
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
                    placeholder={`${formatNumber(props.defaultFrequency)} (default)`}
                />
                <VSCodeButton onClick={onAdd}>
                    {editorState.type === 'adding' ? 'Add' : 'Save'}
                </VSCodeButton>
                <VSCodeButton onClick={onCancel} appearance="secondary">
                    {editorState.type === 'adding' ? 'Clear' : 'Cancel'}
                </VSCodeButton>
            </div>
            {showMissingEventValidation && (
                <ValidationMessage showMissingEventValidation={showMissingEventValidation} />
            )}
            {frequencyWarning && (
                <div className="warning-message">
                    <span className="codicon codicon-warning" />
                    {frequencyWarning}
                </div>
            )}
        </>
    );
};
