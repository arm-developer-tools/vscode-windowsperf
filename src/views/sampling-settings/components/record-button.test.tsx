/*
 * Copyright (c) 2024 Arm Limited
 */

import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { RecordButton } from './record-button';

describe('RecordButton', () => {
    describe('renders the Record Button', () => {
        it('showing the record icon and button text', () => {
            const buttonText = 'Record';

            const { container } = render(<RecordButton onClick={jest.fn()} />);

            const buttonEle = container.querySelector('vscode-button');
            expect(buttonEle?.textContent).toBe(buttonText);
        });
    });

    describe('event handlers', () => {
        it('when clicked calls the onClick handler', () => {
            const handleClick = jest.fn();
            const { container } = render(<RecordButton onClick={handleClick} />);

            const buttonEle = container.querySelector('vscode-button');

            fireEvent.click(buttonEle!);

            expect(handleClick).toHaveBeenCalledTimes(1);
        });
    });
});
