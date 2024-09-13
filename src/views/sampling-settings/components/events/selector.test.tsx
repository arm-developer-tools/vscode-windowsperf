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
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventSelector } from './selector';
import { predefinedEventFactory } from '../../../../wperf/parse/list.factories';
import { eventsEditorEditingStateFactory } from '../../state/events-editor.factories';
import { testResultsFactory } from '../../../../wperf/parse/test.factories';

describe('EventSelector', () => {
    it('renders the event table and edit row', () => {
        const { container } = render(
            <EventSelector
                dispatch={jest.fn()}
                updateRecordOption={jest.fn()}
                selectedEvents={[]}
                predefinedEvents={[predefinedEventFactory()]}
                editorState={eventsEditorEditingStateFactory()}
                recentEvents={[]}
                testResults={testResultsFactory()}
            />,
        );

        expect(container.querySelector('.event-table')).toBeInTheDocument();
        expect(container.querySelector('.event-edit-row')).toBeInTheDocument();
    });
});
