/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorView } from './error-view';

describe('error view', () => {
    it('Renders the wperf-driver error view', () => {
        const { container } = render(
            <ErrorView error={{ type: 'noWperfDriver' }} openWperfOutput={jest.fn()} />,
        );

        const expectedErrorMessage =
            'An error has occurred communicating with the wperf-driver while trying to run "wperf list".';
        expect(container.querySelector('#error-message')?.textContent).toBe(expectedErrorMessage);
    });
    it('Renders the wperf path error view', () => {
        const { container } = render(
            <ErrorView error={{ type: 'noWperf' }} openWperfOutput={jest.fn()} />,
        );

        const expectedErrorMessage =
            'WindowsPerf executable not found while running "wperf list". Is it on the PATH or configured in the extension settings?';

        expect(container.querySelector('#error-message')?.textContent).toBe(expectedErrorMessage);
    });
    it('calls openWperfOutput once when the open log button is clicked', () => {
        const openWperfOutput = jest.fn();
        const { container } = render(
            <ErrorView error={{ type: 'noWperf' }} openWperfOutput={openWperfOutput} />,
        );

        const showOutputButton = container.querySelector('#show-wperf-output-button');

        fireEvent.click(showOutputButton!);

        expect(openWperfOutput).toHaveBeenCalledTimes(1);
    });
});
