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
});
