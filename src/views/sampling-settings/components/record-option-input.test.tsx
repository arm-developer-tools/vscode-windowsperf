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
import { fireEvent, render, screen } from '@testing-library/react';
import { recordOptionsFactory } from '../../../wperf/record-options.factories';
import { RecordOptionInput, RecordOptionInputProps } from './record-option-input';

const mockOnChange = jest.fn();

const mockProps: RecordOptionInputProps = {
    type: 'text',
    recordOption: 'command',
    recordOptions: recordOptionsFactory(),
    isInvalid: false,
    onChange: mockOnChange,
};

const renderRecordOptionInput = (props?: Partial<RecordOptionInputProps>) =>
    render(<RecordOptionInput {...mockProps} {...props} />);

describe('RecordOptionInput', () => {
    it('calls onChanges prop when the input changes', () => {
        renderRecordOptionInput();

        const newCommand = 'new-command';
        fireEvent.change(screen.getByTestId('command-input'), { target: { value: newCommand } });

        expect(mockOnChange).toHaveBeenCalledWith(newCommand);
    });
});
