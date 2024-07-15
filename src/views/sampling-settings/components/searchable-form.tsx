/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { useState } from 'react';

export type FormSection = {
    id: string;
    description: string;
    title: string;
    component: React.ReactNode;
};

export type SearchableFormProps = {
    sections: FormSection[];
};

const Nav = (props: SearchableFormProps) => {
    return (
        <nav>
            <ul>
                {props.sections.map((section) => (
                    <li key={section.id}>
                        <a href={`#${section.id}`}>{section.title}</a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

const Content = (props: SearchableFormProps) => {
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

export const SearchableForm = (props: SearchableFormProps) => {
    const [searchText, updateSearchText] = useState('');

    // TODO: Filter sections based on search text.

    return (
        <>
            <search>
                <input
                    type="text"
                    placeholder="Search settings"
                    value={searchText}
                    onChange={(event) => updateSearchText(event.target.value)}
                />
            </search>
            <Nav sections={props.sections} />
            <Content sections={props.sections} />
        </>
    );
};
