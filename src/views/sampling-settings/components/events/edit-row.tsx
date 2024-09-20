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
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { UpdateRecordOptionAction } from '../../state/update-record-option-action';
import { EventDropdown } from './dropdown';
import { formatNumber } from '../../../../math';
import { EventSelectorProps } from './selector';

const ValidationMessage = (props: { message: string | undefined; show: boolean }) => {
    return (
        <div className="error-message event-edit-row-validation-message">
            {props.message && props.show ? props.message : undefined}
        </div>
    );
};

export type EventEditRowProps = EventSelectorProps;

export const EventEditRow = (props: EventEditRowProps) => {
    const editorState = props.editorState;
    const isEditorStateAdding = editorState.type === 'adding';
    const missingFieldValidation = props.showMissingEventsValidation;
    const { availableGpcCount, samplingIntervalDefault } = props.testResults;
    const invalidRow = props.editorState.validate || missingFieldValidation;

    const decideValidationMessage = () => {
        if (missingFieldValidation) {
            return 'This field is required';
        }
        if (isEditorStateAdding && props.selectedEvents.length >= availableGpcCount) {
            return `You can only sample ${availableGpcCount} events at once`;
        }
        if (!editorState.event.event) {
            return 'Please select an event';
        }
        return undefined;
    };

    const validationMessage = decideValidationMessage();

    const onAdd = () => {
        const formBlockingValidation = validationMessage && !missingFieldValidation;
        if (formBlockingValidation) {
            props.dispatch({
                type: 'validate',
            });
        } else if (editorState.event.event) {
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
        <div className="event-edit-row">
            <div className="event-edit-row-dropdown-container">
                <EventDropdown
                    showInvalidEvent={invalidRow}
                    dispatch={props.dispatch}
                    eventData={{
                        dropdownValue: editorState.event.event,
                        predefinedEvents: props.predefinedEvents,
                        selectedEvents: props.selectedEvents.map(({ event }) => event),
                        recentEvents: props.recentEvents,
                    }}
                />
                <ValidationMessage message={validationMessage} show={invalidRow} />
            </div>
            <div className="event-edit-row-number-input">
                <input
                    type="number"
                    aria-label="Frequency"
                    value={editorState.event.frequency ?? ''}
                    className={frequencyWarning ? 'warning' : ''}
                    onChange={onFrequencyChange}
                    placeholder={`${formatNumber(samplingIntervalDefault)} (default)`}
                />
                {frequencyWarning && (
                    <div className="warning-message">
                        <span className="codicon codicon-warning" />
                        {frequencyWarning}
                    </div>
                )}
            </div>
            <VSCodeButton onClick={onAdd} className="event-edit-row-button">
                {editorState.type === 'adding' ? 'Add' : 'Save'}
            </VSCodeButton>
            <VSCodeButton
                onClick={onCancel}
                appearance="secondary"
                className="event-edit-row-button "
            >
                {editorState.type === 'adding' ? 'Clear' : 'Cancel'}
            </VSCodeButton>
        </div>
    );
};
