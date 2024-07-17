/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Form } from './form';
import { recordOptionsFactory } from '../../../wperf/record-options.factories';
import { UpdateRecordOptionAction } from '../reducer';

describe('Form', () => {
    it('calls updateRecordOption when the command input changes', () => {
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

        const want: UpdateRecordOptionAction = { type: 'setCommand', command: newCommand };
        expect(updateRecordOption).toHaveBeenCalledWith(want);
    });

    it('calls updateRecordOption when the arguments input changes', () => {
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

        const want: UpdateRecordOptionAction = { type: 'setArguments', arguments: newArguments };
        expect(updateRecordOption).toHaveBeenCalledWith(want);
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
