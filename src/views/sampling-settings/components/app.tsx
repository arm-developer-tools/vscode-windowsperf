/**
 * Copyright (C) 2024 Arm Limited
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
        const message: FromView = { type: 'ready' };
        props.postMessage(message);
    }, []);

    useEffect(() => {
        props.container.className = props.state.type;
    }, [props.container, props.state.type]);

    const openWperfOutput = () => {
        const fromView: FromView = { type: 'showOutputChannel' };
        props.postMessage(fromView);
    };

    const refreshView = () => {
        props.dispatch({ type: 'retry' });
        const message: FromView = { type: 'retry' };
        props.postMessage(message);
    };
    if (props.state.type === 'loading') {
        return <LoadingSpinner />;
    } else if (props.state.type === 'error') {
        return (
            <ErrorView
                error={props.state.error}
                openWperfOutput={openWperfOutput}
                refreshView={refreshView}
            />
        );
    } else {
        const updateRecordOption = createUpdateRecordOption({
            postMessage: (message) => props.postMessage(message),
            state: props.state,
            dispatch: props.dispatch,
        });

        const openCommandFilePicker = () => {
            const fromView: FromView = { type: 'openCommandFilePicker' };
            props.postMessage(fromView);
        };

        const handleRecordCommand = () => {
            const fromView: FromView = { type: 'record' };
            props.postMessage(fromView);
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
                    defaultFrequency={props.state.testResults.samplingIntervalDefault}
                />
                <Footer record={handleRecordCommand} recordOptions={props.state.recordOptions} />
            </>
        );
    }
};
