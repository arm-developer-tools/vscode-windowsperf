/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { RecordButton } from './record-button';

export type FormSection = {
    id: string;
    description: string;
    title: string;
    component: React.ReactNode;
    invalid?: boolean;
};

export type NavigableFormProps = {
    sections: FormSection[];
    record: () => void;
};

const Nav = (props: NavigableFormProps) => {
    return (
        <nav>
            <div className="record-button">
                <RecordButton onClick={props.record} />
            </div>
            <ul>
                {props.sections.map((section) => (
                    <li key={section.id}>
                        <a href={`#${section.id}`} className={section.invalid ? 'invalid' : ''}>
                            {section.title}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

const Content = (props: Pick<NavigableFormProps, 'sections'>) => {
    return (
        <section id="content">
            {props.sections.map((section) => (
                <section className="setting" id={section.id} key={section.id}>
                    <h1>{section.title}</h1>
                    <div className="description">{section.description}</div>
                    {section.component}
                </section>
            ))}
        </section>
    );
};

export const NavigableForm = (props: NavigableFormProps) => {
    return (
        <>
            <Nav sections={props.sections} record={props.record} />
            <Content sections={props.sections} />
        </>
    );
};
