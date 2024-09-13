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

import 'jest';
import { UpdateRecordOptionDependencies, createUpdateRecordOption } from './update-record-option';
import { loadedStateFactory } from './state/app.factories';
import { UpdateRecordOptionAction } from './state/update-record-option-action';
import { FromView } from './messages';
import { eventAndFrequencyFactory } from '../../wperf/record-options.factories';

describe('UpdateRecordOption', () => {
    it(' dispatches the action to update the state', () => {
        const dependencies: UpdateRecordOptionDependencies = {
            postMessage: jest.fn(),
            state: loadedStateFactory(),
            dispatch: jest.fn(),
        };
        const updateRecordOption = createUpdateRecordOption(dependencies);
        const action: UpdateRecordOptionAction = {
            type: 'addEvent',
            event: eventAndFrequencyFactory(),
        };

        updateRecordOption(action);

        expect(dependencies.dispatch).toHaveBeenCalledWith(action);
    });

    it('sends a message to the extension backend to update the record options', () => {
        const dependencies: UpdateRecordOptionDependencies = {
            postMessage: jest.fn(),
            state: loadedStateFactory(),
            dispatch: jest.fn(),
        };
        const updateRecordOption = createUpdateRecordOption(dependencies);
        const action: UpdateRecordOptionAction = { type: 'setCommand', command: 'newCommand' };

        updateRecordOption(action);

        const want: FromView = {
            type: 'recordOptions',
            recordOptions: { ...dependencies.state.recordOptions, command: 'newCommand' },
        };
        expect(dependencies.postMessage).toHaveBeenCalledWith(want);
    });
});
