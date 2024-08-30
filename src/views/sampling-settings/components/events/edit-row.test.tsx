/**
 * Copyright (C) 2024 Arm Limited
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

const eventEditRowPropsFactory = (options?: Partial<EventEditRowProps>): EventEditRowProps => ({
    dispatch: options?.dispatch ?? jest.fn(),
    editorState: options?.editorState ?? eventsEditorAddingStateFactory(),
    predefinedEvents: options?.predefinedEvents ?? [],
    selectedEvents: options?.selectedEvents ?? [],
    updateRecordOption: options?.updateRecordOption ?? jest.fn(),
    recentEvents: options?.recentEvents ?? [faker.word.noun()],
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

        render(<EventEditRow {...eventEditRowPropsFactory({ editorState })} />);

        expect(screen.getByPlaceholderText('Frequency')).toHaveValue(42);
    });

    it('dispatches a setFrequency action when the frequency input changes', () => {
        const dispatch = jest.fn();
        const editorState = eventsEditorAddingStateFactory();
        render(<EventEditRow {...eventEditRowPropsFactory({ dispatch, editorState })} />);

        fireEvent.change(screen.getByPlaceholderText('Frequency'), { target: { value: '42' } });

        const want: EventsEditorAction = { type: 'setFrequency', frequency: 42 };
        expect(dispatch).toHaveBeenCalledWith(want);
    });

    it('dispatches a validateMissingFields action when the Add button is clicked before an event is selected', () => {
        const dispatch = jest.fn();
        const editorState = eventsEditorAddingStateFactory({
            event: eventAndFrequencyFactory({ event: '' }),
        });
        render(<EventEditRow {...eventEditRowPropsFactory({ dispatch, editorState })} />);

        fireEvent.click(screen.getByText('Add'));

        const want: EventsEditorAction = { type: 'validateMissingFields' };
        expect(dispatch).toHaveBeenCalledWith(want);
    });

    it('shows a validation message if validateMissingFields is true and an event is not selected', () => {
        const editorState = eventsEditorAddingStateFactory({
            event: eventAndFrequencyFactory({ event: '' }),
            validateMissingFields: true,
        });

        render(<EventEditRow {...eventEditRowPropsFactory({ editorState })} />);

        expect(screen.getByText('Please select an event')).toBeInTheDocument();
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
