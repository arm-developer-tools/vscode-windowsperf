/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';

export type FormSection = {
    id: string;
    description: string;
    title: string;
    component: React.ReactNode;
    invalid?: boolean;
};

export type NavigableFormProps = {
    sections: FormSection[];
};

const Nav = (props: NavigableFormProps) => {
    return (
        <nav>
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

const Content = (props: NavigableFormProps) => {
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
            <Nav sections={props.sections} />
            <Content sections={props.sections} />
        </>
    );
};
