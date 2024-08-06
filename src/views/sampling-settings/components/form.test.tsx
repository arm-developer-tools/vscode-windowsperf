/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Form, FormProps } from './form';
import { recordOptionsFactory } from '../../../wperf/record-options.factories';
import { UpdateRecordOptionAction } from '../state/update-record-option-action';
import { predefinedEventFactory } from '../../../wperf/parse/list.factories';
import { faker } from '@faker-js/faker';
import { eventsEditorStateFactory } from '../state/events-editor.factories';
import { ValidatedField } from '../../../wperf/record-options';

const formPropsFactory = (options?: Partial<FormProps>): FormProps => ({
    cores: options?.cores ?? [],
    events: options?.events ?? [predefinedEventFactory()],
    recentEvents: options?.recentEvents ?? [faker.word.noun()],
    recordOptions: options?.recordOptions ?? recordOptionsFactory(),
    fieldsToValidate: options?.fieldsToValidate ?? [],
    eventsEditorState: options?.eventsEditorState ?? eventsEditorStateFactory(),
    record: options?.record ?? jest.fn(),
    dispatch: options?.dispatch ?? jest.fn(),
    openCommandFilePicker: options?.openCommandFilePicker ?? jest.fn(),
    updateRecordOption: options?.updateRecordOption ?? jest.fn(),
});

describe('Form', () => {
    it('calls updateRecordOption when the command input changes', () => {
        const props = formPropsFactory();
        render(<Form {...props} />);

        const newCommand = 'new-command';
        fireEvent.change(screen.getByTestId('command-input'), { target: { value: newCommand } });

        const want: UpdateRecordOptionAction = { type: 'setCommand', command: newCommand };
        expect(props.updateRecordOption).toHaveBeenCalledWith(want);
    });

    it('calls updateRecordOption when the arguments input changes', () => {
        const props = formPropsFactory();
        render(<Form {...props} />);

        const newArguments = '-some -arguments';
        fireEvent.change(screen.getByTestId('arguments-input'), {
            target: { value: newArguments },
        });

        const want: UpdateRecordOptionAction = { type: 'setArguments', arguments: newArguments };
        expect(props.updateRecordOption).toHaveBeenCalledWith(want);
    });

    it('renders the event selection', () => {
        render(<Form {...formPropsFactory()} />);

        expect(screen.queryByText('Events', { selector: 'h1' })).toBeInTheDocument();
    });

    it('renders the CPU Core selection', () => {
        render(<Form {...formPropsFactory()} />);

        expect(screen.queryByText('CPU Core', { selector: 'h1' })).toBeInTheDocument();
    });

    it('calls openCommandFilePicker when the browse button is clicked', () => {
        const props = formPropsFactory();
        render(<Form {...props} />);

        fireEvent.click(screen.getByText('Browse'));

        expect(props.openCommandFilePicker).toHaveBeenCalled();
    });

    it('calls record when the record event button is clicked', () => {
        const props = formPropsFactory();
        render(<Form {...props} />);

        const recordButton = screen.getAllByText('Record');
        fireEvent.click(recordButton[0]!);

        expect(props.record).toHaveBeenCalled();
    });

    it('does not render the command input with an invalid class when the command is missing but command is not a field to validate', () => {
        const recordOptions = recordOptionsFactory({ command: '' });
        const props = formPropsFactory({ recordOptions });

        render(<Form {...props} />);

        expect(screen.getByTestId('command-input')).not.toHaveClass('invalid');
    });

    it('renders the command input with an invalid class when the command is missing and command is a field to validate', () => {
        const fieldsToValidate: ValidatedField[] = ['command'];
        const recordOptions = recordOptionsFactory({ command: '' });
        const props = formPropsFactory({ recordOptions, fieldsToValidate });

        render(<Form {...props} />);

        expect(screen.getByTestId('command-input')).toHaveClass('invalid');
    });
});
