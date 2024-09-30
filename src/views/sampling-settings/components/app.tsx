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
import { Dispatch, useEffect } from 'react';
import { FromView } from '../messages';
import { Action, State } from '../state/app';
import { Form } from './form';
import { LoadingSpinner } from './loading-spinner';
import { createUpdateRecordOption } from '../update-record-option';
import { Footer } from './footer';
import { ErrorView } from './error-view';

export type AppProps = {
    postMessage: (message: FromView) => void;
    container: HTMLElement;
    dispatch: Dispatch<Action>;
    state: State;
};

export const App = (props: AppProps) => {
    useEffect(() => {
        props.postMessage({ type: 'ready' });
    }, []);

    useEffect(() => {
        props.container.className = props.state.type;
    }, [props.container, props.state.type]);

    const openWperfOutput = () => {
        props.postMessage({ type: 'showOutputChannel' });
    };

    const disableVersionCheck = () => {
        props.dispatch({ type: 'retry' });
        props.postMessage({ type: 'disableVersionCheck' });
    };

    const refreshView = () => {
        props.dispatch({ type: 'retry' });
        props.postMessage({ type: 'retry' });
    };
    if (props.state.type === 'loading') {
        return <LoadingSpinner />;
    } else if (props.state.type === 'error') {
        return (
            <ErrorView
                error={props.state.error}
                openWperfOutput={openWperfOutput}
                runSystemCheck={() => props.postMessage({ type: 'runSystemCheck' })}
                refreshView={refreshView}
                disableVersionCheck={disableVersionCheck}
            />
        );
    } else {
        const updateRecordOption = createUpdateRecordOption({
            postMessage: (message) => props.postMessage(message),
            state: props.state,
            dispatch: props.dispatch,
        });

        const openCommandFilePicker = () => {
            props.postMessage({ type: 'openCommandFilePicker' });
        };

        const handleRecordCommand = () => {
            props.postMessage({ type: 'record' });
            props.dispatch({ type: 'updateRecentEvents' });
        };

        return (
            <>
                <Form
                    cores={props.state.cores}
                    events={props.state.events}
                    recordOptions={props.state.recordOptions}
                    openCommandFilePicker={openCommandFilePicker}
                    updateRecordOption={updateRecordOption}
                    fieldsToValidate={props.state.fieldsToValidate}
                    recentEvents={props.state.recentEvents}
                    dispatch={props.dispatch}
                    eventsEditorState={props.state.eventsEditor}
                    testResults={props.state.testResults}
                    hasLlvmObjdump={props.state.hasLlvmObjDumpPath}
                />
                <Footer record={handleRecordCommand} recordOptions={props.state.recordOptions} />
            </>
        );
    }
};
