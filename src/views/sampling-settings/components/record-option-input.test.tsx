/**
 * Copyright (C) 2024 Arm Limited
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
