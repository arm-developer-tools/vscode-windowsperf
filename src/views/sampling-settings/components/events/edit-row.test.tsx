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
import 'jest';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { EventsEditorAction } from '../../state/events-editor';
import { EventEditRow, EventEditRowProps } from './edit-row';
import {
    eventsEditorAddingStateFactory,
    eventsEditorEditingStateFactory,
} from '../../state/events-editor.factories';
import { eventAndFrequencyFactory } from '../../../../wperf/record-options.factories';
import { faker } from '@faker-js/faker';
import { formatNumber } from '../../../../math';
import { testResultsFactory } from '../../../../wperf/parse/test.factories';
import { UpdateRecordOptionAction } from '../../state/update-record-option-action';

const eventEditRowPropsFactory = (options?: Partial<EventEditRowProps>): EventEditRowProps => ({
    dispatch: jest.fn(),
    editorState: eventsEditorAddingStateFactory(),
    predefinedEvents: [],
    selectedEvents: [],
    updateRecordOption: jest.fn(),
    recentEvents: [faker.word.noun()],
    testResults: testResultsFactory(),
    showMissingEventsValidation: false,
    ...options,
});

describe('EventEditRow', () => {
    it('renders Add and Clear buttons when the edit state is adding', () => {
        const editorState = eventsEditorAddingStateFactory();

        render(<EventEditRow {...eventEditRowPropsFactory({ editorState })} />);

        expect(screen.getByText('Add')).toBeInTheDocument();
        expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('renders Save and Cancel when the edit state is editing', () => {
        const editorState = eventsEditorEditingStateFactory();

        render(<EventEditRow {...eventEditRowPropsFactory({ editorState })} />);

        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('dispatches a cancel action when the Cancel or Clear buttons are clicked', () => {
        const dispatch = jest.fn();
        const editorState = eventsEditorAddingStateFactory();
        render(<EventEditRow {...eventEditRowPropsFactory({ dispatch, editorState })} />);

        fireEvent.click(screen.getByText('Clear'));

        const want: EventsEditorAction = { type: 'cancel' };
        expect(dispatch).toHaveBeenCalledWith(want);
    });

    it('shows the currently selected frequency in the frequency input', () => {
        const editorState = eventsEditorEditingStateFactory({
            event: eventAndFrequencyFactory({ frequency: 42 }),
        });
        const samplingIntervalDefault = 25000;

        render(
            <EventEditRow
                {...eventEditRowPropsFactory({
                    editorState,
                    testResults: testResultsFactory({ samplingIntervalDefault }),
                })}
            />,
        );

        expect(
            screen.getByPlaceholderText(`${formatNumber(samplingIntervalDefault)} (default)`),
        ).toHaveValue(42);
    });

    it('dispatches a setFrequency action when the frequency input changes', () => {
        const dispatch = jest.fn();
        const editorState = eventsEditorAddingStateFactory();
        const samplingIntervalDefault = 25000;
        render(
            <EventEditRow
                {...eventEditRowPropsFactory({
                    dispatch,
                    editorState,
                    testResults: testResultsFactory({ samplingIntervalDefault }),
                })}
            />,
        );

        fireEvent.change(
            screen.getByPlaceholderText(`${formatNumber(samplingIntervalDefault)} (default)`),
            {
                target: { value: '42' },
            },
        );

        const want: EventsEditorAction = { type: 'setFrequency', frequency: 42 };
        expect(dispatch).toHaveBeenCalledWith(want);
    });

    it('dispatches a validate action when the Add button is clicked before an event is selected', () => {
        const dispatch = jest.fn();
        const editorState = eventsEditorAddingStateFactory({
            event: eventAndFrequencyFactory({ event: '' }),
        });
        render(<EventEditRow {...eventEditRowPropsFactory({ dispatch, editorState })} />);

        fireEvent.click(screen.getByText('Add'));

        const want: EventsEditorAction = {
            type: 'validate',
        };
        expect(dispatch).toHaveBeenCalledWith(want);
    });

    it('dispatch a validate action when trying to add an event when the maximum available is already selected', () => {
        const dispatch = jest.fn();
        const selectedEvents = [
            eventAndFrequencyFactory(),
            eventAndFrequencyFactory(),
            eventAndFrequencyFactory(),
        ];
        const availableGpcCount = 3;
        render(
            <EventEditRow
                {...eventEditRowPropsFactory({
                    dispatch,
                    selectedEvents,
                    testResults: testResultsFactory({ availableGpcCount }),
                })}
            />,
        );

        fireEvent.click(screen.getByText('Add'));

        const want: EventsEditorAction = {
            type: 'validate',
        };
        expect(dispatch).toHaveBeenCalledWith(want);
    });

    it('adds an event when there is a show missing events validation', () => {
        const mockUpdateRecordOption = jest.fn();
        const availableGpcCount = 3;
        const props = eventEditRowPropsFactory({
            selectedEvents: [],
            testResults: testResultsFactory({ availableGpcCount }),
            updateRecordOption: mockUpdateRecordOption,
            showMissingEventsValidation: true,
        });
        render(<EventEditRow {...props} />);

        fireEvent.click(screen.getByText('Add'));

        const want: UpdateRecordOptionAction = {
            event: {
                event: props.editorState.event.event,
                frequency: props.editorState.event.frequency,
            },
            type: 'addEvent',
        };
        expect(mockUpdateRecordOption).toHaveBeenCalledWith(want);
    });

    it('shows field required validation message when missing event prop is true', () => {
        const props = eventEditRowPropsFactory({
            showMissingEventsValidation: true,
        });
        render(<EventEditRow {...props} />);

        fireEvent.click(screen.getByText('Add'));

        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('does not add and shows a validation message if an event is not selected', () => {
        const mockUpdateRecordOption = jest.fn();
        const editorState = eventsEditorAddingStateFactory({
            event: eventAndFrequencyFactory({ event: '' }),
            validate: true,
        });

        render(
            <EventEditRow
                {...eventEditRowPropsFactory({
                    editorState,
                    updateRecordOption: mockUpdateRecordOption,
                })}
            />,
        );

        fireEvent.click(screen.getByText('Add'));

        expect(mockUpdateRecordOption).not.toHaveBeenCalled();
        expect(screen.getByText('Please select an event')).toBeInTheDocument();
    });

    it('does not dispatch a validate action when trying to edit an event when the maximum available is selected', () => {
        const dispatch = jest.fn();
        const eventToEdit = eventAndFrequencyFactory();
        const selectedEvents = [
            eventToEdit,
            eventAndFrequencyFactory(),
            eventAndFrequencyFactory(),
        ];
        const availableGpcCount = 3;
        render(
            <EventEditRow
                {...eventEditRowPropsFactory({
                    editorState: eventsEditorEditingStateFactory({ event: eventToEdit }),
                    dispatch,
                    selectedEvents,
                    testResults: testResultsFactory({ availableGpcCount }),
                })}
            />,
        );

        fireEvent.click(screen.getByText('Save'));

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('shows a validation message if validate is true, the editor state type is Adding and the number of selected events is at maximum available', () => {
        const editorState = eventsEditorAddingStateFactory({
            event: eventAndFrequencyFactory(),
            validate: true,
        });
        const eventToEdit = eventAndFrequencyFactory();
        const selectedEvents = [
            eventToEdit,
            eventAndFrequencyFactory(),
            eventAndFrequencyFactory(),
        ];
        const testResults = testResultsFactory({ availableGpcCount: 3 });

        render(
            <EventEditRow
                {...eventEditRowPropsFactory({ editorState, selectedEvents, testResults })}
            />,
        );

        expect(
            screen.getByText(`You can only sample ${testResults.availableGpcCount} events at once`),
        ).toBeInTheDocument();
    });

    it('shows a warning message if the frequency entered is above the max supported frequency', () => {
        const editorState = eventsEditorAddingStateFactory({
            event: eventAndFrequencyFactory({ frequency: 4294967296 }),
        });
        render(<EventEditRow {...eventEditRowPropsFactory({ editorState })} />);

        expect(
            screen.getByText('Exceeds the maximum frequency supported by WindowsPerf'),
        ).toBeInTheDocument();
    });
});
