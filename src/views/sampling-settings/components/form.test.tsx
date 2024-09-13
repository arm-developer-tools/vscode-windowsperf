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
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Form, FormProps } from './form';
import { recordOptionsFactory } from '../../../wperf/record-options.factories';
import { UpdateRecordOptionAction } from '../state/update-record-option-action';
import { predefinedEventFactory } from '../../../wperf/parse/list.factories';
import { faker } from '@faker-js/faker';
import { eventsEditorAddingStateFactory } from '../state/events-editor.factories';
import { ValidatedField } from '../../../wperf/record-options';
import { testResultsFactory } from '../../../wperf/parse/test.factories';

export const formPropsFactory = (options?: Partial<FormProps>): FormProps => ({
    cores: [],
    events: [predefinedEventFactory()],
    recentEvents: [faker.word.noun()],
    recordOptions: recordOptionsFactory(),
    fieldsToValidate: [],
    eventsEditorState: eventsEditorAddingStateFactory(),
    dispatch: jest.fn(),
    openCommandFilePicker: jest.fn(),
    updateRecordOption: jest.fn(),
    testResults: testResultsFactory(),
    hasLlvmObjdump: false,
    ...options,
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

        expect(screen.queryByText('CPU core', { selector: 'h1' })).toBeInTheDocument();
    });

    it('calls openCommandFilePicker when the browse button is clicked', () => {
        const props = formPropsFactory();
        render(<Form {...props} />);

        fireEvent.click(screen.getByText('Browse'));

        expect(props.openCommandFilePicker).toHaveBeenCalled();
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

    it('renders the disassemble view', () => {
        render(<Form {...formPropsFactory()} />);

        expect(screen.queryByText('Disassemble', { selector: 'h1' })).toBeInTheDocument();
    });

    it('renders the disassemble warning message if llvm-objdump is not on the path', () => {
        const props = formPropsFactory({ hasLlvmObjdump: false });
        render(<Form {...props} />);

        expect(
            screen.queryByText('requires llvm-objdump to be installed', { exact: false }),
        ).toBeInTheDocument();
    });

    it('does not render the disassemble warning message if llvm-objdump is on the path', () => {
        const props = formPropsFactory({ hasLlvmObjdump: true });
        render(<Form {...props} />);

        expect(
            screen.queryByText('requires llvm-objdump to be installed', { exact: false }),
        ).not.toBeInTheDocument();
    });

    it('calls updateRecordOption when the timeout input changes', () => {
        const props = formPropsFactory();
        render(<Form {...props} />);

        const newTimeout = '7200';
        fireEvent.change(screen.getByTestId('timeoutSeconds-input'), {
            target: { value: newTimeout },
        });

        const want: UpdateRecordOptionAction = { type: 'setTimeout', timeout: newTimeout };
        expect(props.updateRecordOption).toHaveBeenCalledWith(want);
    });
});
