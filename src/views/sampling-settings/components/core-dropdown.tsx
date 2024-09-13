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
import { Dropdown, OptionGroup } from '../../common/components/dropdown';
import { Core } from '../../../wperf/cores';
import { UpdateRecordOption } from '../update-record-option';

interface CoresDropdownOption {
    name: string;
    value: string;
}

export const createCoreDropdownOptions = (data: Core[]): OptionGroup<CoresDropdownOption>[] => {
    const items: OptionGroup<CoresDropdownOption> = {
        options: data.map((core) => ({
            name: `Core ${core.number} - ${core.model}`,
            value: core.number.toString(),
        })),
    };
    return [items];
};

interface CoreDropdownProps {
    cores: Core[];
    selectedCore: string;
    updateRecordOption: UpdateRecordOption;
}

export const CoreDropdown = ({ cores, selectedCore, updateRecordOption }: CoreDropdownProps) => {
    return (
        <div className="form-cores-container">
            <Dropdown
                value={selectedCore}
                onChange={(value) => {
                    updateRecordOption({
                        type: 'setCore',
                        core: parseInt(value),
                    });
                }}
                options={createCoreDropdownOptions(cores)}
                scrollHeight="400px"
                optionLabel="name"
                optionValue="value"
            />
        </div>
    );
};
