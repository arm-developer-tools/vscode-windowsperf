/**
 * Copyright (C) 2024 Arm Limited
 */

import { Dispatch } from 'react';
import { FromView } from './messages';
import { LoadedState } from './state/app';
import { updateRecordOptionReducer } from './state/update-record-option-action';
import { UpdateRecordOptionAction } from './state/update-record-option-action';

export type UpdateRecordOptionDependencies = {
    postMessage: (message: FromView) => void;
    state: LoadedState;
    dispatch: Dispatch<UpdateRecordOptionAction>;
};

export type UpdateRecordOption = (action: UpdateRecordOptionAction) => void;

export const createUpdateRecordOption =
    (dependencies: UpdateRecordOptionDependencies): UpdateRecordOption =>
    (action) => {
        const newRecordOptions = updateRecordOptionReducer(
            dependencies.state.recordOptions,
            action,
        );

        const fromView: FromView = { type: 'recordOptions', recordOptions: newRecordOptions };
        dependencies.postMessage(fromView);

        dependencies.dispatch(action);
    };
