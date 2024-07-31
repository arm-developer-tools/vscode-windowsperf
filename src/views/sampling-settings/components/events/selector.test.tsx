/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventSelector } from './selector';
import { predefinedEventFactory } from '../../../../wperf/parse/list.factories';

describe('EventSelector', () => {
    it('renders the event table', () => {
        const { container } = render(
            <EventSelector
                updateRecordOption={jest.fn()}
                selectedEvents={[]}
                predefinedEvents={[predefinedEventFactory()]}
            />,
        );

        expect(container.querySelector('.event-table')).toBeInTheDocument();
    });
});
