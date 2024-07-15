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

export const Form = (_props: FormProps) => {
    return (
        <SearchableForm
            sections={[
                {
                    id: 'section-1',
                    title: 'Section 1',
                    description: 'This is the first section of the settings.',
                    component: <div>Some input 1</div>,
                },
                {
                    id: 'section-2',
                    title: 'Section 2',
                    description: 'This is the second section of the settings.',
                    component: <div>Some input 2</div>,
                },
                {
                    id: 'section-3',
                    title: 'Section 3',
                    description: 'This is the third section of the settings.',
                    component: <div>Some input 3</div>,
                },
            ]}
        />
    );
};
