/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { Core } from '../../../wperf/cores';
import { PredefinedEvent } from '../../../wperf/parse/list';
import { RecordOptions } from '../../../wperf/record-options';
import { SearchableForm } from './searchable-form';

type UpdateRecordOption = <K extends keyof RecordOptions>(key: K, value: RecordOptions[K]) => void;

export type FormProps = {
    cores: Core[];
    events: PredefinedEvent[];
    recordOptions: RecordOptions;
    updateRecordOption: UpdateRecordOption;
};

type RecordOptionTextInputProps = {
    recordOption: 'command' | 'arguments';
    recordOptions: RecordOptions;
    updateRecordOption: UpdateRecordOption;
};

const RecordOptionTextInput = (props: RecordOptionTextInputProps) => {
    return (
        <div>
            <input
                type="text"
                value={props.recordOptions[props.recordOption]}
                data-testid={`${props.recordOption}-input`}
                onChange={(event) => {
                    props.updateRecordOption(props.recordOption, event.target.value);
                }}
            />
        </div>
    );
};

export const Form = (props: FormProps) => {
    return (
        <SearchableForm
            sections={[
                {
                    id: 'command',
                    title: 'Command',
                    description:
                        'The executable to spawn. Absolute path or relative to the workspace root.',
                    component: (
                        <RecordOptionTextInput
                            recordOption="command"
                            recordOptions={props.recordOptions}
                            updateRecordOption={props.updateRecordOption}
                        />
                    ),
                },
                {
                    id: 'arguments',
                    title: 'Arguments',
                    description: 'The arguments to pass to the command.',
                    component: (
                        <RecordOptionTextInput
                            recordOption="arguments"
                            recordOptions={props.recordOptions}
                            updateRecordOption={props.updateRecordOption}
                        />
                    ),
                },
            ]}
        />
    );
};
