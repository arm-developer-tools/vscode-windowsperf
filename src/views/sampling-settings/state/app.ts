/**
 * Copyright (C) 2024 Arm Limited
 */

import { updateRecentEvents } from '../../../recent-events';
import { Core } from '../../../wperf/cores';
import { PredefinedEvent } from '../../../wperf/parse/list';
import { TestResults } from '../../../wperf/parse/test';
import { RecordOptions, ValidatedField, validatedFields } from '../../../wperf/record-options';
import { ErrorDetail, ToView } from '../messages';
import {
    EventsEditorAction,
    eventsEditorReducer,
    EventsEditorState,
    initialEventsEditorState,
    isEventEditorAction,
} from './events-editor';
import {
    getAffectedField,
    isUpdateRecordOptionAction,
    UpdateRecordOptionAction,
    updateRecordOptionReducer,
} from './update-record-option-action';

export type LoadedState = {
    type: 'loaded';
    cores: Core[];
    events: PredefinedEvent[];
    testResults: TestResults;
    recentEvents: string[];
    recordOptions: RecordOptions;
    fieldsToValidate: readonly ValidatedField[];
    eventsEditor: EventsEditorState;
};

export type State = { type: 'loading' } | { type: 'error'; error: ErrorDetail } | LoadedState;

export const initialState: State = { type: 'loading' };

export type RetryAction = { type: 'retry' };

export type UpdateRecentEventsAction = { type: 'updateRecentEvents' };
export type HandleMessageAction = { type: 'handleMessage'; message: ToView };
export type Action =
    | HandleMessageAction
    | UpdateRecentEventsAction
    | UpdateRecordOptionAction
    | RetryAction
    | EventsEditorAction;

const initialDataToState = (message: Extract<ToView, { type: 'initialData' }>): State => {
    if (message.eventsLoadResult.type === 'error') {
        return { type: 'error', error: message.eventsLoadResult.error };
    } else if (message.testResultsLoadResult.type === 'error') {
        return { type: 'error', error: message.testResultsLoadResult.error };
    } else {
        return {
            type: 'loaded',
            cores: message.cores,
            recentEvents: message.recentEvents,
            events: message.eventsLoadResult.events,
            testResults: message.testResultsLoadResult.testResults,
            recordOptions: message.recordOptions,
            fieldsToValidate: message.validate ? validatedFields : [],
            eventsEditor: initialEventsEditorState,
        };
    }
};

const toViewMessageReducer = (state: State, message: ToView): State => {
    switch (message.type) {
        case 'initialData':
            return initialDataToState(message);
        case 'selectedCommand':
            return state.type === 'loaded'
                ? { ...state, recordOptions: { ...state.recordOptions, command: message.command } }
                : state;
        case 'validate':
            return state.type === 'loaded'
                ? { ...state, fieldsToValidate: validatedFields }
                : state;
    }
};

const loadedStateReducer = (
    state: LoadedState,
    action: UpdateRecentEventsAction | UpdateRecordOptionAction | EventsEditorAction,
): LoadedState => {
    if (isUpdateRecordOptionAction(action)) {
        const affectedField = getAffectedField(action);

        return {
            ...state,
            recordOptions: updateRecordOptionReducer(state.recordOptions, action),
            fieldsToValidate: state.fieldsToValidate.filter((field) => field !== affectedField),
            eventsEditor: initialEventsEditorState,
        };
    } else if (isEventEditorAction(action)) {
        return {
            ...state,
            eventsEditor: eventsEditorReducer(
                state.recordOptions.events,
                state.eventsEditor,
                action,
            ),
        };
    } else if (action.type === 'updateRecentEvents') {
        return {
            ...state,
            recentEvents: updateRecentEvents(state.recentEvents, state.recordOptions),
        };
    } else {
        return action;
    }
};

export const reducer = (state: State, action: Action): State => {
    if (action.type === 'handleMessage') {
        return toViewMessageReducer(state, action.message);
    } else if (action.type === 'retry') {
        return { type: 'loading' };
    } else {
        if (state.type === 'loaded') {
            return loadedStateReducer(state, action);
        } else {
            return state;
        }
    }
};
