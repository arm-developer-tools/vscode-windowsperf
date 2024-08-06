/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventSelector } from './selector';
import { predefinedEventFactory } from '../../../../wperf/parse/list.factories';
import { eventsEditorStateFactory } from '../../state/events-editor.factories';

describe('EventSelector', () => {
    it('renders the event table and edit row', () => {
        const { container } = render(
            <EventSelector
                dispatch={jest.fn()}
                updateRecordOption={jest.fn()}
                selectedEvents={[]}
                predefinedEvents={[predefinedEventFactory()]}
                editorState={eventsEditorStateFactory()}
                recentEvents={[]}
            />,
        );

        expect(container.querySelector('.event-table')).toBeInTheDocument();
        expect(container.querySelector('.event-edit-row')).toBeInTheDocument();
    });
});
