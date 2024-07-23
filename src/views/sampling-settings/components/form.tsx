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

export type FormProps = {
    cores: Core[];
    events: PredefinedEvent[];
    recordOptions: RecordOptions;
    openCommandFilePicker: () => void;
    updateRecordOption: UpdateRecordOption;
    fieldsToValidate: readonly ValidatedField[];
};

type RecordOptionTextInputProps = {
    recordOption: 'command' | 'arguments';
    recordOptions: RecordOptions;
    isInvalid: boolean;
    onChange: (value: string) => void;
};

const RecordOptionTextInput = (props: RecordOptionTextInputProps) => {
    return (
        <input
            type="text"
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
                                <RecordOptionTextInput
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
                            <RecordOptionTextInput
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
            ]}
        />
    );
};
