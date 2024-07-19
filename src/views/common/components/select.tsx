/*
 * Copyright (c) 2024 Arm Limited
 */

import * as React from 'react';

type SelectProps = {
    items: string[];
    selected: string;
    onChange: (input: string) => void;
};

export const Select = (props: SelectProps) => {
    const { items, selected, onChange } = props;

    return (
        <select value={selected} onChange={(event) => onChange(event.target.value)}>
            {items.map((item, idx) => (
                <option key={idx} value={item}>
                    {item}
                </option>
            ))}
        </select>
    );
};
