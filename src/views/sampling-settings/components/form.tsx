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
import { Select } from '../../common/components/select';
import { Dispatch } from 'react';
import { EventsEditorAction, EventsEditorState } from '../state/events-editor';
import { Core } from '../../../wperf/cores';
import { PredefinedEvent } from '../../../wperf/parse/list';

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
};

type RecordOptionInputProps = {
    type: 'text' | 'number';
    recordOption: 'command' | 'arguments' | 'timeoutSeconds';
    recordOptions: RecordOptions;
    isInvalid: boolean;
    onChange: (value: string) => void;
};

const RecordOptionInput = (props: RecordOptionInputProps) => {
    return (
        <div className="input-wrapper">
            <input
                type={props.type}
                className={props.isInvalid ? 'invalid' : ''}
                value={props.recordOptions[props.recordOption]}
                data-testid={`${props.recordOption}-input`}
                onChange={(event) => {
                    props.onChange(event.target.value);
                }}
            />
            {props.isInvalid ? <i className="codicon codicon-error input-icon"></i> : undefined}
        </div>
    );
};

export const Form = ({ dispatch, ...props }: FormProps) => {
    const { missingFields } = validateRecordOptions(props.recordOptions);
    const showMissingCommandValidation =
        props.fieldsToValidate.includes('command') && missingFields.includes('command');
    const showMissingEventsValidation =
        props.fieldsToValidate.includes('events') && missingFields.includes('events');
    return (
        <>
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
                                    'The executable to run. Specify an absolute path or one relative to the root directory of the project.',
                                invalid: showMissingCommandValidation,
                                component: (
                                    <>
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
                                                <div className="error-message">
                                                    This field is required
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ),
                            },
                            {
                                id: 'arguments',
                                title: 'Arguments',
                                description: 'The arguments to pass to the command',
                                component: (
                                    <div>
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
                                    </div>
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
                                'Hardware events to sample and how often WindowsPerf samples each event',
                            invalid: showMissingEventsValidation,
                            component: (
                                <>
                                    <EventSelector
                                        predefinedEvents={props.events}
                                        editorState={props.eventsEditorState}
                                        dispatch={dispatch}
                                        recentEvents={props.recentEvents}
                                        selectedEvents={props.recordOptions.events}
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
                            description: 'The CPU core to monitor',
                            component: (
                                <div>
                                    <Select
                                        items={props.cores.map((core) => ({
                                            id: core.number.toString(),
                                            label: `Core ${core.number} - ${core.model}`,
                                        }))}
                                        selected={props.recordOptions.core.toString() || ''}
                                        onChange={(value) => {
                                            props.updateRecordOption({
                                                type: 'setCore',
                                                core: parseInt(value),
                                            });
                                        }}
                                    />
                                </div>
                            ),
                        }),
                    },
                    {
                        id: 'timeout',
                        title: 'Timeout',
                        component: createSection({
                            id: 'timeout',
                            title: 'Timeout',
                            description:
                                'The maximum number of seconds that the recording runs for',
                            component: (
                                <div>
                                    <RecordOptionInput
                                        type="number"
                                        recordOption="timeoutSeconds"
                                        recordOptions={props.recordOptions}
                                        isInvalid={false}
                                        onChange={(value) => {
                                            props.updateRecordOption({
                                                type: 'setTimeout',
                                                timeout: value,
                                            });
                                        }}
                                    />
                                </div>
                            ),
                        }),
                    },
                ]}
            />
        </>
    );
};
