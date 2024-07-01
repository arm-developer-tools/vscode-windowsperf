/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { Dispatch } from 'react';
import { Action } from '../reducer';
import { RecordOptions } from '../../../wperf/record-options';
import { PredefinedEvent } from '../../../wperf/parse/list';
import { Core } from '../messages';

export type FormProps = {
    dispatch: Dispatch<Action>;
    cores: Core[];
    events: PredefinedEvent[];
    recordOptions: RecordOptions;
};

type Section = {
    id: string;
    description: string;
    title: string;
    component: React.ReactNode;
};

export const Form = (_: FormProps) => {
    const sections: Section[] = [
        {
            id: 'section-1',
            title: 'Section 1',
            description: 'This is the first section of the settings.',
            component: <div>Some input 1</div>,
        },
        {
            id: 'section-1',
            title: 'Section 2',
            description: 'This is the second section of the settings.',
            component: <div>Some input 2</div>,
        },
        {
            id: 'section-1',
            title: 'Section 3',
            description: 'This is the third section of the settings.',
            component: <div>Some input 3</div>,
        },
    ];

    return (
        <>
            <search>
                <input type="text" placeholder="Search settings" />
            </search>
            <nav>
                <ul>
                    {sections.map((section) => (
                        <li>
                            <a href={`#${section.id}`}>{section.title}</a>
                        </li>
                    ))}
                </ul>
            </nav>
            <section id="content">
                {sections.map((section) => (
                    <section className="setting" id={section.id}>
                        <h1>{section.title}</h1>
                        <div>{section.description}</div>
                        {section.component}
                    </section>
                ))}
            </section>
        </>
    );
};
