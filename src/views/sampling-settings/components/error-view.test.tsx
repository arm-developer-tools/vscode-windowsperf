/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorView, errorMessages } from './error-view';

describe('error view', () => {
    it('Renders the wperf-driver error view', () => {
        const { container } = render(
            <ErrorView
                error={{ type: 'noWperfDriver' }}
                openWperfOutput={jest.fn()}
                refreshView={jest.fn()}
            />,
        );

        const expectedErrorMessage = errorMessages['noWperfDriver'];
        expect(container.querySelector('#error-message')?.textContent).toBe(expectedErrorMessage);
    });
    it('Renders the wperf path error view', () => {
        const { container } = render(
            <ErrorView
                error={{ type: 'noWperf' }}
                openWperfOutput={jest.fn()}
                refreshView={jest.fn()}
            />,
        );

        const expectedErrorMessage = errorMessages['noWperf'];

        expect(container.querySelector('#error-message')?.textContent).toBe(expectedErrorMessage);
    });
    it('Renders the version incompatibility error view', () => {
        const { container } = render(
            <ErrorView
                error={{ type: 'versionMismatch' }}
                openWperfOutput={jest.fn()}
                refreshView={jest.fn()}
            />,
        );

        const expectedErrorMessage = errorMessages['versionMismatch'];

        expect(container.querySelector('#error-message')!.textContent).toBe(expectedErrorMessage);
    });
    it('calls openWperfOutput once when the open log button is clicked', () => {
        const openWperfOutput = jest.fn();
        const refreshView = jest.fn();
        const { container } = render(
            <ErrorView
                error={{ type: 'noWperf' }}
                openWperfOutput={openWperfOutput}
                refreshView={refreshView}
            />,
        );

        const showOutputButton = container.querySelector('#show-wperf-output-button');

        fireEvent.click(showOutputButton!);

        expect(openWperfOutput).toHaveBeenCalledTimes(1);
    });
    it('calls refreshView once when the retry button is clicked', () => {
        const openWperfOutput = jest.fn();
        const refreshView = jest.fn();
        const { container } = render(
            <ErrorView
                error={{ type: 'noWperfDriver' }}
                openWperfOutput={openWperfOutput}
                refreshView={refreshView}
            />,
        );

        const retryButton = container.querySelector('#retry-button');

        fireEvent.click(retryButton!);

        expect(refreshView).toHaveBeenCalledTimes(1);
    });
});
