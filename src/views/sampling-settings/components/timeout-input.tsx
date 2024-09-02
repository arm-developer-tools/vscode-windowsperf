/*
 * Copyright (c) 2024 Arm Limited
 */

import React from 'react';
import { RecordOptions } from '../../../wperf/record-options';
import { RecordOptionInput } from './record-option-input';

export type TimeoutSecondsProps = {
    recordOptions: RecordOptions;
    onChange: (value: string) => void;
};

const pluralise = (count: number, singular: 'day' | 'hour'): string => {
    return count === 1 ? singular : `${singular}s`;
};

const formatTimeout = (seconds: number): string => {
    if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        return `${hours} ${pluralise(hours, 'hour')}`;
    } else {
        const days = Math.floor(seconds / 86400);
        return `${days} ${pluralise(days, 'day')}`;
    }
};

const getTimeoutWarning = (timeoutSeconds: number | undefined): string | undefined => {
    if (timeoutSeconds !== undefined && timeoutSeconds >= 3600) {
        const formattedTime = formatTimeout(timeoutSeconds);
        return `Timeout = ${formattedTime} - this could take a while.`;
    }
    return undefined;
};

export const TimeoutSeconds = (props: TimeoutSecondsProps) => {
    const timeoutWarning = getTimeoutWarning(props.recordOptions.timeoutSeconds);

    return (
        <div>
            <RecordOptionInput
                type="number"
                recordOptions={props.recordOptions}
                isInvalid={false}
                onChange={props.onChange}
                recordOption="timeoutSeconds"
            />
            {timeoutWarning && (
                <div className="warning-message">
                    <span className="codicon codicon-warning"></span>
                    {timeoutWarning}
                </div>
            )}
        </div>
    );
};
