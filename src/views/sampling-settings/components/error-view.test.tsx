/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorView, ErrorViewProps, errorMessages } from './error-view';

const mockProps: ErrorViewProps = {
    error: { type: 'noWperfDriver' },
    openWperfOutput: jest.fn(),
    refreshView: jest.fn(),
    runSystemCheck: jest.fn(),
};

const renderErrorView = (props?: Partial<ErrorViewProps>) =>
    render(<ErrorView {...mockProps} {...props} />);

describe('error view', () => {
    it('Renders the wperf-driver error view', () => {
        const { container } = renderErrorView();

        const expectedErrorMessage = errorMessages['noWperfDriver'];
        expect(container.querySelector('#error-message')?.textContent).toBe(expectedErrorMessage);
    });
    it('Renders the wperf path error view', () => {
        const { container } = renderErrorView({ error: { type: 'noWperf' } });

        const expectedErrorMessage = errorMessages['noWperf'];

        expect(container.querySelector('#error-message')?.textContent).toBe(expectedErrorMessage);
    });
    it('Renders the version incompatibility error view', () => {
        const { container } = renderErrorView({ error: { type: 'versionMismatch' } });

        const expectedErrorMessage = errorMessages['versionMismatch'];

        expect(container.querySelector('#error-message')!.textContent).toBe(expectedErrorMessage);
    });
    it('calls openWperfOutput once when the open log button is clicked', () => {
        const openWperfOutput = jest.fn();
        const { container } = renderErrorView({
            error: { type: 'noWperf' },
            openWperfOutput,
        });

        const showOutputButton = container.querySelector('#show-wperf-output-button');

        fireEvent.click(showOutputButton!);

        expect(openWperfOutput).toHaveBeenCalledTimes(1);
    });
    it('calls refreshView once when the retry button is clicked', () => {
        const refreshView = jest.fn();
        const { container } = renderErrorView({
            refreshView,
        });

        const retryButton = container.querySelector('#retry-button');

        fireEvent.click(retryButton!);

        expect(refreshView).toHaveBeenCalledTimes(1);
    });

    it('calls runSystemCheck once when the run system check button is clicked', () => {
        const runSystemCheck = jest.fn();
        const { container } = renderErrorView({
            runSystemCheck,
        });

        const runSystemCheckButton = container.querySelector('#run-system-check-button');

        fireEvent.click(runSystemCheckButton!);

        expect(runSystemCheck).toHaveBeenCalledTimes(1);
    });
});
