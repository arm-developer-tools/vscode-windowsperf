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
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Dropdown, DropdownProps } from './dropdown';

const dropdownPropsFactory = (
    options?: Partial<DropdownProps<'value', 'label', { label: string; value: string }>>,
): DropdownProps<'value', 'label', { label: string; value: string }> => ({
    options: [],
    optionLabel: 'label',
    optionValue: 'value',
    onChange: jest.fn(),
    value: '',
    ...options,
});

describe('Dropdown', () => {
    it('has the invalid class when the invalid prop is given', () => {
        const { container } = render(<Dropdown {...dropdownPropsFactory({ invalid: true })} />);

        expect(container.querySelector('.dropdown')).toHaveClass('invalid');
    });

    it('does not have the class invalid when the invalid prop is not given', () => {
        const { container } = render(<Dropdown {...dropdownPropsFactory({ invalid: false })} />);

        expect(container.querySelector('.dropdown')).not.toHaveClass('invalid');
    });

    it('has the has-placeholder class when using the placeholder', () => {
        const props = dropdownPropsFactory({ placeholder: 'Test Placeholder', value: '' });
        const { container } = render(<Dropdown {...props} />);

        expect(container.querySelector('.dropdown')).toHaveClass('has-placeholder');
    });

    it('does not have the has-placeholder class when not using the placeholder', () => {
        const props = dropdownPropsFactory({
            placeholder: 'Test Placeholder',
            value: 'Some value',
        });
        const { container } = render(<Dropdown {...props} />);

        expect(container.querySelector('.dropdown')).not.toHaveClass('has-placeholder');
    });

    it('has any classes defined in the className prop', () => {
        const className = 'test-class';
        const props = dropdownPropsFactory({ className });
        const { container } = render(<Dropdown {...props} />);

        expect(container.querySelector('.dropdown')).toHaveClass(className);
    });
});
