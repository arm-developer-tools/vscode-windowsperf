/*
 * Copyright (c) 2024 Arm Limited
 */

import * as React from 'react';
import './select.css';

export type SelectOption = {
    id: string;
    label: string;
};

type SelectProps = {
    items: SelectOption[];
    selected: string;
    onChange: (input: string) => void;
};

export const Select = (props: SelectProps) => {
    const { items, selected, onChange } = props;

    return (
        <select value={selected} onChange={(event) => onChange(event.target.value)}>
            {items.map((item) => (
                <option key={item.id} value={item.id}>
                    {item.label}
                </option>
            ))}
        </select>
    );
};
