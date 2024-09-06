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
import { Checkbox } from '../../common/components/checkbox';

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
    hasLlvmObjdump: boolean;
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
                {
                    id: 'enable-disassemble',
                    title: 'Disassemble',
                    component: createSection({
                        id: 'enable-disassemble',
                        title: 'Disassemble',
                        description: (
                            <>
                                <span>Enable disassembly view in your output.</span>
                                {!props.hasLlvmObjdump && (
                                    <div className="warning-message">
                                        <span className="codicon codicon-warning" />
                                        <span>
                                            Requires llvm-objdump to be installed and on your PATH,
                                            read more in our{' '}
                                            <a href="https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/tree/main/wperf?ref_type=heads#using-the-disassemble-option">
                                                documentation
                                            </a>
                                            .
                                        </span>
                                    </div>
                                )}
                            </>
                        ),
                        component: (
                            <Checkbox
                                label="Enable"
                                isChecked={props.recordOptions.disassembleEnabled}
                                onChangeCallback={(e) =>
                                    props.updateRecordOption({
                                        type: 'setDisassembleEnabled',
                                        enabled: e.target.checked,
                                    })
                                }
                            />
                        ),
                    }),
                },
            ]}
        />
    );
};
