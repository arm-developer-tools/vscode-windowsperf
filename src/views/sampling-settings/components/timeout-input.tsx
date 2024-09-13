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
