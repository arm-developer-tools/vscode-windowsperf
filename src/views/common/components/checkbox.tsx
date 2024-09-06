import React, { ChangeEvent, useId } from 'react';

export interface CheckboxProps {
    label?: string;
    name?: string;
    isDisabled?: boolean;
    isChecked: boolean;
    onChangeCallback: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox = ({
    isChecked,
    onChangeCallback,
    label,
    name,
    isDisabled,
}: CheckboxProps) => {
    const id = useId();

    return (
        <div>
            <input
                type="checkbox"
                disabled={isDisabled}
                id={id}
                name={name || id}
                checked={isChecked}
                onChange={(e) => onChangeCallback(e)}
            />
            {label && <label htmlFor={id}>{label}</label>}
        </div>
    );
};
