/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { Core } from '../../../wperf/cores';
import { PredefinedEvent } from '../../../wperf/parse/list';
import { RecordOptions } from '../../../wperf/record-options';
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
};

type RecordOptionTextInputProps = {
    recordOption: 'command' | 'arguments';
    recordOptions: RecordOptions;
    onChange: (value: string) => void;
};

const RecordOptionTextInput = (props: RecordOptionTextInputProps) => {
    return (
        <input
            type="text"
            value={props.recordOptions[props.recordOption]}
            data-testid={`${props.recordOption}-input`}
            onChange={(event) => {
                props.onChange(event.target.value);
            }}
        />
    );
};

export const Form = (props: FormProps) => {
    return (
        <NavigableForm
            sections={[
                {
                    id: 'command',
                    title: 'Command',
                    description:
                        'The executable to spawn. Absolute path or relative to the workspace root.',
                    component: (
                        <>
                            <div className="file-picker-input">
                                <RecordOptionTextInput
                                    recordOption="command"
                                    recordOptions={props.recordOptions}
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
                    component: (
                        <EventSelector
                            events={props.events}
                            recordOptions={props.recordOptions}
                            updateRecordOption={props.updateRecordOption}
                        />
                    ),
                },
            ]}
        />
    );
};
