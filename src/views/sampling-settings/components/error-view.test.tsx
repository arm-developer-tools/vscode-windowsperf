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
import '@testing-library/jest-dom';
import { ErrorView, ErrorViewProps, errorMessages } from './error-view';

const mockProps: ErrorViewProps = {
    error: { type: 'noWperfDriver' },
    openWperfOutput: jest.fn(),
    refreshView: jest.fn(),
    disableVersionCheck: jest.fn(),
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

    it('calls disableVersionCheck once when the Allow Incompatible Versions button is clicked', () => {
        const disableVersionCheck = jest.fn();
        const { container } = renderErrorView({
            disableVersionCheck,
            error: {
                type: 'versionIncompatible',
            },
        });

        const disableVersionCheckButton = container.querySelector(
            '#allow-incompatible-version-check-button',
        );

        fireEvent.click(disableVersionCheckButton!);

        expect(disableVersionCheck).toHaveBeenCalledTimes(1);
    });

    it('Allow Incompatible Versions button is hidden when it is not a versionIncompatible error', () => {
        const disableVersionCheck = jest.fn();
        const { container } = renderErrorView({
            disableVersionCheck,
            error: {
                type: 'noWperf',
            },
        });

        expect(
            container.querySelector('#allow-incompatible-version-check-button'),
        ).not.toBeInTheDocument();
    });
});
