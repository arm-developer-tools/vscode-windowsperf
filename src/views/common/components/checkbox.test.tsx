/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Checkbox, CheckboxProps } from './checkbox';

const mockOnChangeCallback = jest.fn();
const mockCheckboxProps: CheckboxProps = {
    isChecked: false,
    onChangeCallback: mockOnChangeCallback,
};

const renderCheckBox = (props?: Partial<CheckboxProps>) =>
    render(<Checkbox {...mockCheckboxProps} {...props} />);

describe('Checkbox', () => {
    it('show label if label is passed', () => {
        const { container } = renderCheckBox({
            label: 'mock-label',
        });

        expect(container.querySelector('label')?.textContent).toBe('mock-label');
    });

    it('label is not rendered if label prop is not passed', () => {
        const { container } = renderCheckBox();

        expect(container.querySelector('label')).toBeNull();
    });

    it('calls onChangeCallback when label is clicked', () => {
        const { container } = renderCheckBox({
            label: 'mock-label',
        });

        fireEvent.click(container.querySelector('label')!);

        expect(mockOnChangeCallback).toHaveBeenCalled();
    });
});
