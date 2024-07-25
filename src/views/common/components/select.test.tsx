/*
 * Copyright (c) 2024 Arm Limited
 */

import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Select } from './select';

describe('Select', () => {
    describe('rendering the Select component', () => {
        it('confirms selection option is selected', () => {
            const items = [
                { id: 'A', label: 'label A' },
                { id: 'B', label: 'label B' },
            ];
            const selection = 'B';

            const { container } = render(
                <Select items={items} selected={selection} onChange={jest.fn()} />,
            );

            const selectedEle = container.querySelector('select');

            expect(selectedEle!.value).toBe(selection);
        });

        it('displays all the options', () => {
            const items = [
                { id: 'A', label: 'label A' },
                { id: 'B', label: 'label B' },
            ];
            const selection = 'A';

            const { container } = render(
                <Select items={items} selected={selection} onChange={jest.fn()} />,
            );

            const selectOptions = container.querySelectorAll('option');

            expect(selectOptions.length).toBe(2);
            expect(selectOptions[0]!.value).toBe(items[0]!.id);
            expect(selectOptions[1]!.value).toBe(items[1]!.id);
        });
    });

    describe('events handler', () => {
        it('when a new option is selected, calls event handler with that option', async () => {
            const items = [
                { id: 'A', label: 'label A' },
                { id: 'B', label: 'label B' },
            ];
            const selection = 'A';
            const handleChange = jest.fn();

            const { container } = render(
                <Select items={items} selected={selection} onChange={handleChange} />,
            );

            const select = container.getElementsByTagName('select').item(0);

            fireEvent.change(select!, { target: { value: items[1]!.id } });

            expect(handleChange).toHaveBeenCalledTimes(1);
            expect(handleChange).toHaveBeenCalledWith(items[1]!.id);
        });
    });
});
