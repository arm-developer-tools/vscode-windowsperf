/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { useEffect, useReducer } from 'react';
import { WebviewApi } from 'vscode-webview';
import { toViewShape } from '../messages';
import { initialState, reducer } from '../state/app';
import { App } from './app';
import { PrimeReactProvider } from 'primereact/api';

export type RootProps = {
    api: WebviewApi<unknown>;
    container: HTMLElement;
};

const createMessageHandler =
    (dispatch: React.Dispatch<any>) =>
    ({ data }: MessageEvent) => {
        const parseResult = toViewShape.safeParse(data);

        if (parseResult.success) {
            const toView = parseResult.data;
            dispatch({ type: 'handleMessage', message: toView });
        } else {
            console.error('Invalid message received', data);
        }
    };

export const Root = ({ api, container }: RootProps) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const handler = createMessageHandler(dispatch);
        window.addEventListener('message', handler);

        return () => {
            window.removeEventListener('message', handler);
        };
    }, []);

    return (
        <PrimeReactProvider>
            <App
                postMessage={api.postMessage.bind(api)}
                container={container}
                state={state}
                dispatch={dispatch}
            />
        </PrimeReactProvider>
    );
};
