/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { Core } from '../../../wperf/cores';
import { PredefinedEvent } from '../../../wperf/parse/list';
import {
    RecordOptions,
    ValidatedField,
    validateRecordOptions,
} from '../../../wperf/record-options';
import { NavigableForm } from './navigable-form';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { EventSelector } from './event-selector';
import { UpdateRecordOption } from '../update-record-option';
import { Select } from '../../common/components/select';

export type FormProps = {
    cores: Core[];
    events: PredefinedEvent[];
    recordOptions: RecordOptions;
    openCommandFilePicker: () => void;
    updateRecordOption: UpdateRecordOption;
    fieldsToValidate: readonly ValidatedField[];
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
        <input
            type={props.type}
            className={props.isInvalid ? 'invalid' : ''}
            value={props.recordOptions[props.recordOption]}
            data-testid={`${props.recordOption}-input`}
            onChange={(event) => {
                props.onChange(event.target.value);
            }}
        />
    );
};

export const Form = (props: FormProps) => {
    const { missingFields } = validateRecordOptions(props.recordOptions);
    const showMissingCommandValidation =
        props.fieldsToValidate.includes('command') && missingFields.includes('command');
    const showMissingEventsValidation =
        props.fieldsToValidate.includes('events') && missingFields.includes('events');

    return (
        <NavigableForm
            sections={[
                {
                    id: 'command',
                    title: 'Command',
                    description:
                        'The executable to spawn. Absolute path or relative to the workspace root.',
                    invalid: showMissingCommandValidation,
                    component: (
                        <>
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
                        </>
                    ),
                },
                {
                    id: 'arguments',
                    title: 'Arguments',
                    description: 'The arguments to pass to the command.',
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
                {
                    id: 'core',
                    title: 'CPU Core',
                    description: 'Specifies the CPU Core to monitor.',
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
                },
                {
                    id: 'events',
                    title: 'Events',
                    description: 'The hardware events to sample.',
                    invalid: showMissingEventsValidation,
                    component: (
                        <>
                            <EventSelector
                                events={props.events}
                                recordOptions={props.recordOptions}
                                updateRecordOption={props.updateRecordOption}
                            />
                            {showMissingEventsValidation && (
                                <div className="error-message">This field is required</div>
                            )}
                        </>
                    ),
                },
                {
                    id: 'timeout',
                    title: 'Timeout',
                    description:
                        'Specifies the maximum time in seconds the recording can run before it is stopped.',
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
                },
            ]}
        />
    );
};
