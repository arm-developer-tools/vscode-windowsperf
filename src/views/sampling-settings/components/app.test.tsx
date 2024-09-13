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
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from './app';
import { loadedStateFactory } from '../state/app.factories';

const containerFactory = (): HTMLElement => document.createElement('div');

describe('App', () => {
    it('sends a ready message on first render', () => {
        const postMessage = jest.fn();
        render(
            <App
                postMessage={postMessage}
                container={containerFactory()}
                state={{ type: 'loading' }}
                dispatch={jest.fn()}
            />,
        );

        expect(postMessage).toHaveBeenCalledWith({ type: 'ready' });
    });

    it('keeps the container class in sync with the state type', () => {
        const container = containerFactory();
        const baseProps = { postMessage: jest.fn(), container, dispatch: jest.fn() } as const;

        render(<App {...baseProps} state={{ type: 'loading' }} />);
        expect(container.className).toBe('loading');

        render(<App {...baseProps} state={{ type: 'error', error: { type: 'noWperf' } }} />);
        expect(container.className).toBe('error');

        render(<App {...baseProps} state={loadedStateFactory()} />);
        expect(container.className).toBe('loaded');
    });

    it('renders the loading spinner when the state type is loading', () => {
        const { container } = render(
            <App
                postMessage={jest.fn()}
                container={containerFactory()}
                state={{ type: 'loading' }}
                dispatch={jest.fn()}
            />,
        );

        expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
    });

    it('renders the error view when the state type is error', () => {
        const { container } = render(
            <App
                postMessage={jest.fn()}
                container={containerFactory()}
                state={{ type: 'error', error: { type: 'unknown' } }}
                dispatch={jest.fn()}
            />,
        );

        expect(container.querySelector('.error-view')).toBeInTheDocument();
    });

    it('renders the form when the state type is not loading', () => {
        render(
            <App
                postMessage={jest.fn()}
                container={containerFactory()}
                state={loadedStateFactory()}
                dispatch={jest.fn()}
            />,
        );

        expect(screen.queryByText('Events', { selector: 'h1' })).toBeInTheDocument();
    });
});
