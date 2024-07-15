/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { useEffect, useReducer } from 'react';
import { WebviewApi } from 'vscode-webview';
import { FromView, toViewShape } from '../messages';
import { initialState, reducer } from '../reducer';
import { Form } from './form';
import { LoadingSpinner } from './loading-spinner';

export type AppProps = {
    api: WebviewApi<unknown>;
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

export const App = (props: AppProps) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const handler = createMessageHandler(dispatch);
        window.addEventListener('message', handler);
        const message: FromView = { type: 'ready' };
        props.api.postMessage(message);

        return () => {
            window.removeEventListener('message', handler);
        };
    }, []);

    if (state.type === 'loading') {
        return <LoadingSpinner />;
    } else if (state.type === 'error') {
        return <div>Error</div>;
    } else {
        return (
            <Form
                dispatch={dispatch}
                cores={state.cores}
                events={state.events}
                recordOptions={state.recordOptions}
            />
        );
    }
};
