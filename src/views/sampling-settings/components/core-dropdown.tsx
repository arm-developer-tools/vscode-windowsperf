/**
 * Copyright (C) 2024 Arm Limited
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
