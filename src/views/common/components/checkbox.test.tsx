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
