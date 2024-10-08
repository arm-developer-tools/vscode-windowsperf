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
    hasLlvmObjDumpPath: boolean;
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
    if (message.eventsAndTestLoadResult.type === 'error') {
        return { type: 'error', error: message.eventsAndTestLoadResult.error };
    } else {
        return {
            type: 'loaded',
            cores: message.cores,
            recentEvents: message.recentEvents,
            events: message.eventsAndTestLoadResult.events,
            testResults: message.eventsAndTestLoadResult.testResults,
            recordOptions: message.recordOptions,
            fieldsToValidate: message.validate ? validatedFields : [],
            eventsEditor: initialEventsEditorState,
            hasLlvmObjDumpPath: message.hasLlvmObjDumpPath,
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
