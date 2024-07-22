/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from './app';
import { loadedStateFactory } from '../reducer.factories';

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

        render(<App {...baseProps} state={{ type: 'error', error: {} }} />);
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

    it('renders the error message when the state type is error', () => {
        render(
            <App
                postMessage={jest.fn()}
                container={containerFactory()}
                state={{ type: 'error', error: {} }}
                dispatch={jest.fn()}
            />,
        );

        expect(screen.queryByText('Error')).toBeInTheDocument();
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
