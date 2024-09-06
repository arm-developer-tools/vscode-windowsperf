/**
 * Copyright (C) 2024 Arm Limited
 */

import React from 'react';
import { RecordOptions } from '../../../wperf/record-options';

export interface RecordOptionInputProps {
    type: 'text' | 'number';
    recordOption: 'command' | 'arguments' | 'timeoutSeconds';
    recordOptions: RecordOptions;
    isInvalid: boolean;
    onChange: (value: string) => void;
}

export const RecordOptionInput = (props: RecordOptionInputProps) => {
    return (
        <div className="input-wrapper">
            <input
                type={props.type}
                className={props.isInvalid ? 'invalid' : ''}
                value={props.recordOptions[props.recordOption] ?? ''}
                data-testid={`${props.recordOption}-input`}
                onChange={(event) => {
                    props.onChange(event.target.value);
                }}
            />
            {props.isInvalid ? <i className="codicon codicon-error input-icon"></i> : undefined}
        </div>
    );
};
