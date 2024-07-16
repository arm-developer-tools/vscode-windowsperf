/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Form } from './form';
import { recordOptionsFactory } from '../../../wperf/record-options.factories';

describe('Form', () => {
    it('updates the command record option when the input changes', () => {
        const updateRecordOption = jest.fn();
        render(
            <Form
                cores={[]}
                events={[]}
                recordOptions={recordOptionsFactory()}
                openCommandFilePicker={jest.fn()}
                updateRecordOption={updateRecordOption}
            />,
        );

        const newCommand = 'new-command';
        fireEvent.change(screen.getByTestId('command-input'), { target: { value: newCommand } });

        expect(updateRecordOption).toHaveBeenCalledWith('command', newCommand);
    });

    it('updates the arguments record option when the input changes', () => {
        const updateRecordOption = jest.fn();
        render(
            <Form
                cores={[]}
                events={[]}
                recordOptions={recordOptionsFactory()}
                openCommandFilePicker={jest.fn()}
                updateRecordOption={updateRecordOption}
            />,
        );

        const newArguments = '-some -arguments';
        fireEvent.change(screen.getByTestId('arguments-input'), {
            target: { value: newArguments },
        });

        expect(updateRecordOption).toHaveBeenCalledWith('arguments', newArguments);
    });

    it('calls openCommandFilePicker when the browse button is clicked', () => {
        const openCommandFilePicker = jest.fn();
        render(
            <Form
                cores={[]}
                events={[]}
                recordOptions={recordOptionsFactory()}
                openCommandFilePicker={openCommandFilePicker}
                updateRecordOption={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByText('Browse'));

        expect(openCommandFilePicker).toHaveBeenCalled();
    });
});
