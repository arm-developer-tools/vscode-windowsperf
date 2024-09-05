/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import {
    RecordOptions,
    ValidatedField,
    validateRecordOptions,
} from '../../../wperf/record-options';
import { createGroupSection, createSection, NavigableForm } from './navigable-form';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { EventSelector } from './events/selector';
import { UpdateRecordOption } from '../update-record-option';
import { Dispatch } from 'react';
import { EventsEditorAction, EventsEditorState } from '../state/events-editor';
import { Core } from '../../../wperf/cores';
import { PredefinedEvent } from '../../../wperf/parse/list';
import { TimeoutSeconds } from './timeout-input';
import { RecordOptionInput } from './record-option-input';
import { CoreDropdown } from './core-dropdown';

export type FormProps = {
    cores: Core[];
    events: PredefinedEvent[];
    recordOptions: RecordOptions;
    openCommandFilePicker: () => void;
    updateRecordOption: UpdateRecordOption;
    fieldsToValidate: readonly ValidatedField[];
    dispatch: Dispatch<EventsEditorAction>;
    recentEvents: string[];
    eventsEditorState: EventsEditorState;
    defaultFrequency: number;
};

export const Form = ({ dispatch, ...props }: FormProps) => {
    const { missingFields } = validateRecordOptions(props.recordOptions);
    const showMissingCommandValidation =
        props.fieldsToValidate.includes('command') && missingFields.includes('command');
    const showMissingEventsValidation =
        props.fieldsToValidate.includes('events') && missingFields.includes('events');

    return (
        <NavigableForm
            sections={[
                {
                    id: 'command-specification',
                    title: 'Command Specification',
                    invalid: showMissingCommandValidation,
                    component: createGroupSection([
                        {
                            id: 'executable-path',
                            title: 'Executable path',
                            description:
                                'Executable to run. Specify an absolute path or one relative to the root directory of the project.',
                            invalid: showMissingCommandValidation,
                            component: (
                                <div className="file-picker">
                                    <div className="file-picker-input">
                                        <RecordOptionInput
                                            type="text"
                                            recordOption="command"
                                            recordOptions={props.recordOptions}
                                            isInvalid={showMissingCommandValidation}
                                            onChange={(value) => {
                                                props.updateRecordOption({
                                                    type: 'setCommand',
                                                    command: value,
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="file-picker-control">
                                        <VSCodeButton onClick={props.openCommandFilePicker}>
                                            Browse
                                        </VSCodeButton>
                                    </div>
                                    {showMissingCommandValidation && (
                                        <div className="error-message">This field is required</div>
                                    )}
                                </div>
                            ),
                        },
                        {
                            id: 'arguments',
                            title: 'Arguments',
                            description: 'Arguments to pass to the command.',
                            component: (
                                <RecordOptionInput
                                    type="text"
                                    recordOption="arguments"
                                    recordOptions={props.recordOptions}
                                    isInvalid={false}
                                    onChange={(value) => {
                                        props.updateRecordOption({
                                            type: 'setArguments',
                                            arguments: value,
                                        });
                                    }}
                                />
                            ),
                        },
                    ]),
                },
                {
                    id: 'events',
                    title: 'Events',
                    invalid: showMissingEventsValidation,
                    component: createSection({
                        id: 'events',
                        title: 'Events',
                        description:
                            'Which hardware events to sample and how often to sample each event.',
                        invalid: showMissingEventsValidation,
                        component: (
                            <>
                                <EventSelector
                                    predefinedEvents={props.events}
                                    editorState={props.eventsEditorState}
                                    dispatch={dispatch}
                                    recentEvents={props.recentEvents}
                                    selectedEvents={props.recordOptions.events}
                                    defaultFrequency={props.defaultFrequency}
                                    updateRecordOption={props.updateRecordOption}
                                />
                                {showMissingEventsValidation && (
                                    <div className="error-message">This field is required</div>
                                )}
                            </>
                        ),
                    }),
                },
                {
                    id: 'core',
                    title: 'CPU core',
                    component: createSection({
                        id: 'core',
                        title: 'CPU core',
                        description: 'CPU core to monitor.',
                        component: (
                            <CoreDropdown
                                cores={props.cores}
                                selectedCore={props.recordOptions.core.toString()}
                                updateRecordOption={props.updateRecordOption}
                            />
                        ),
                    }),
                },
                {
                    id: 'timeout',
                    title: 'Timeout',
                    component: createSection({
                        id: 'timeout',
                        title: 'Timeout',
                        description: 'Maximum recording duration in seconds.',
                        component: (
                            <TimeoutSeconds
                                recordOptions={props.recordOptions}
                                onChange={(value) => {
                                    props.updateRecordOption({
                                        type: 'setTimeout',
                                        timeout: value,
                                    });
                                }}
                            />
                        ),
                    }),
                },
            ]}
        />
    );
};
