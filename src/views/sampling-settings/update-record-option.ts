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
