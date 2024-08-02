/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createGroupSection, createSection, NavigableForm } from './navigable-form';

describe('NavigableForm', () => {
    it('renders each component of the given sections', () => {
        render(
            <NavigableForm
                record={jest.fn}
                sections={[
                    {
                        id: 'one',
                        title: 'Section One',
                        component: createSection({
                            id: 'one',
                            description: 'The first section',
                            title: 'Section One',
                            component: <p>1</p>,
                        }),
                    },
                    {
                        id: 'two',
                        title: 'The group section',
                        component: createGroupSection([
                            {
                                id: 'two',
                                description: 'The second section',
                                title: 'Section Two',
                                component: <p>2</p>,
                            },
                        ]),
                    },
                ]}
            />,
        );

        expect(screen.queryByText('1')).toBeInTheDocument();
        expect(screen.queryByText('Section One', { selector: 'h2' })).toBeInTheDocument();
        expect(screen.queryByText('The first section')).toBeInTheDocument();
        expect(screen.queryByText('The group section', { selector: 'h2' })).toBeInTheDocument();
        expect(screen.queryByText('2')).toBeInTheDocument();
        expect(screen.queryByText('Section Two', { selector: 'h1' })).toBeInTheDocument();
        expect(screen.queryByText('The second section')).toBeInTheDocument();
    });

    it('renders a nav entry for each of the given sections', () => {
        render(
            <NavigableForm
                record={jest.fn}
                sections={[
                    {
                        id: 'one',
                        title: 'Section One',
                        component: createSection({
                            id: 'one',
                            description: 'The first section',
                            title: 'Section One',
                            component: <p>1</p>,
                        }),
                    },
                    {
                        id: 'two',
                        title: 'The group section',
                        component: createGroupSection([
                            {
                                id: 'two',
                                description: 'The second section',
                                title: 'Section Two',
                                component: <p>2</p>,
                            },
                        ]),
                    },
                ]}
            />,
        );

        expect(screen.queryByText('Section One', { selector: 'a' })).toHaveAttribute(
            'href',
            '#one',
        );
        expect(screen.queryByText('The group section', { selector: 'a' })).toHaveAttribute(
            'href',
            '#two',
        );
    });
});
