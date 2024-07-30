/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Form } from './form';
import { recordOptionsFactory } from '../../../wperf/record-options.factories';
import { UpdateRecordOptionAction } from '../state/update-record-option-action';

describe('Form', () => {
    it('calls updateRecordOption when the command input changes', () => {
        const updateRecordOption = jest.fn();
        render(
            <Form
                cores={[]}
                events={[]}
                recordOptions={recordOptionsFactory()}
                record={jest.fn()}
                openCommandFilePicker={jest.fn()}
                updateRecordOption={updateRecordOption}
                fieldsToValidate={[]}
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
                record={jest.fn()}
                openCommandFilePicker={jest.fn()}
                updateRecordOption={updateRecordOption}
                fieldsToValidate={[]}
            />,
        );

        const newArguments = '-some -arguments';
        fireEvent.change(screen.getByTestId('arguments-input'), {
            target: { value: newArguments },
        });

        const want: UpdateRecordOptionAction = { type: 'setArguments', arguments: newArguments };
        expect(updateRecordOption).toHaveBeenCalledWith(want);
    });

    it('renders the event selection', () => {
        render(
            <Form
                cores={[]}
                events={[]}
                recordOptions={recordOptionsFactory()}
                record={jest.fn()}
                openCommandFilePicker={jest.fn()}
                updateRecordOption={jest.fn()}
                fieldsToValidate={[]}
            />,
        );

        expect(screen.queryByText('Events', { selector: 'h1' })).toBeInTheDocument();
    });

    it('renders the CPU Core selection', () => {
        render(
            <Form
                cores={[]}
                events={[]}
                recordOptions={recordOptionsFactory()}
                record={jest.fn()}
                openCommandFilePicker={jest.fn()}
                updateRecordOption={jest.fn()}
                fieldsToValidate={[]}
            />,
        );

        expect(screen.queryByText('CPU Core', { selector: 'h1' })).toBeInTheDocument();
    });

    it('calls openCommandFilePicker when the browse button is clicked', () => {
        const openCommandFilePicker = jest.fn();
        render(
            <Form
                cores={[]}
                events={[]}
                recordOptions={recordOptionsFactory()}
                record={jest.fn()}
                openCommandFilePicker={openCommandFilePicker}
                updateRecordOption={jest.fn()}
                fieldsToValidate={[]}
            />,
        );

        fireEvent.click(screen.getByText('Browse'));

        expect(openCommandFilePicker).toHaveBeenCalled();
    });

    it('calls record when the record event button is clicked', () => {
        const record = jest.fn();
        render(
            <Form
                cores={[]}
                events={[]}
                recordOptions={recordOptionsFactory()}
                record={record}
                openCommandFilePicker={jest.fn()}
                updateRecordOption={jest.fn()}
                fieldsToValidate={[]}
            />,
        );

        const recordButton = screen.getAllByText('Record');
        fireEvent.click(recordButton[0]!);

        expect(record).toHaveBeenCalled();
    });

    it('does not render the command input with an invalid class when the command is missing but command is not a field to validate', () => {
        render(
            <Form
                cores={[]}
                events={[]}
                recordOptions={recordOptionsFactory({ command: '' })}
                openCommandFilePicker={jest.fn()}
                record={jest.fn()}
                updateRecordOption={jest.fn()}
                fieldsToValidate={[]}
            />,
        );

        expect(screen.getByTestId('command-input')).not.toHaveClass('invalid');
    });

    it('renders the command input with an invalid class when the command is missing and command is a field to validate', () => {
        render(
            <Form
                cores={[]}
                events={[]}
                recordOptions={recordOptionsFactory({ command: '' })}
                openCommandFilePicker={jest.fn()}
                record={jest.fn()}
                updateRecordOption={jest.fn()}
                fieldsToValidate={['command']}
            />,
        );

        expect(screen.getByTestId('command-input')).toHaveClass('invalid');
    });
});
