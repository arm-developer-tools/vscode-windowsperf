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
        <PrimeReactProvider value={{ unstyled: true }}>
            <App
                postMessage={api.postMessage.bind(api)}
                container={container}
                state={state}
                dispatch={dispatch}
            />
        </PrimeReactProvider>
    );
};
