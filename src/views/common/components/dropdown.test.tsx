/**
 * Copyright (C) 2024 Arm Limited
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
