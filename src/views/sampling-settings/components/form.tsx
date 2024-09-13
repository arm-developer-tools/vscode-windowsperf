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
import { TestResults } from '../../../wperf/parse/test';
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
    testResults: TestResults;
    hasLlvmObjdump: boolean;
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
                        description: (
                            <>
                                <p>
                                    Which hardware events to sample and how often to sample each
                                    event.
                                </p>
                                Sample up to {props.testResults.availableGpcCount} events at once.
                            </>
                        ),
                        tooltip: `Number of events you can sample at once may change depending on the number of processor counters being used by other processes. Currently, ${props.testResults.availableGpcCount} out of ${props.testResults.totalGpcCount} counters are available.`,
                        invalid: showMissingEventsValidation,
                        component: (
                            <>
                                <EventSelector
                                    predefinedEvents={props.events}
                                    editorState={props.eventsEditorState}
                                    dispatch={dispatch}
                                    recentEvents={props.recentEvents}
                                    selectedEvents={props.recordOptions.events}
                                    testResults={props.testResults}
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
