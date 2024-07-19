/*
 * Copyright (c) 2024 Arm Limited
 */

import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Select } from './select';

describe('Select', () => {
    describe('rendering the Select component', () => {
        it('confirms selection option is selected', () => {
            const items = ['A', 'B'];
            const selection = 'B';

            const { container } = render(
                <Select items={items} selected={selection} onChange={jest.fn()} />,
            );

            const selectedEle = container.querySelector('select');

            expect(selectedEle!.value).toBe(items[1]);
        });

        it('displays all the options', () => {
            const items = ['A', 'B'];

            const { container } = render(
                <Select items={items} selected={''} onChange={jest.fn()} />,
            );

            const selectOptions = container.querySelectorAll('option');

            expect(selectOptions.length).toBe(2);
            expect(selectOptions[0]!.value).toBe(items[0]);
            expect(selectOptions[1]!.value).toBe(items[1]);
        });
    });

    describe('events handler', () => {
        it('when a new option is selected, calls event handler with that option', async () => {
            const items = ['A', 'B'];
            const handleChange = jest.fn();

            const { container } = render(
                <Select items={items} selected={''} onChange={handleChange} />,
            );

            const select = container.getElementsByTagName('select').item(0);

            fireEvent.change(select!, { target: { value: items[1] } });

            expect(handleChange).toHaveBeenCalledTimes(1);
            expect(handleChange).toHaveBeenCalledWith(items[1]);
        });
    });
});
