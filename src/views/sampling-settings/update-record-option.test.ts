/**
 * Copyright (C) 2024 Arm Limited
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
