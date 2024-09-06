/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { Fragment } from 'react';

export type FormSection = {
    id: string;
    title: string;
    component: GroupSection | ItemSection;
    invalid?: boolean;
};

type GroupSection = {
    type: 'group';
    contents: FormContent[];
};

type ItemSection = {
    type: 'item';
    content: FormContent;
};

type FormContent = {
    id: string;
    description: React.ReactNode;
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
                            {section.invalid ? (
                                <span className="invalid super-impose">*</span>
                            ) : undefined}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

const FormBody = (props: Pick<NavigableFormProps, 'sections'>) => {
    const content = props.sections.map((section) => {
        if (section.component.type === 'group') {
            return (
                <Fragment key={section.id}>
                    <h1 id={section.id}>{section.title}</h1>
                    {section.component.contents.map((content) => {
                        return <Content content={content} type="child" key={content.id} />;
                    })}
                </Fragment>
            );
        } else {
            return <Content key={section.id} content={section.component.content} type="parent" />;
        }
    });
    return <section className="content">{content}</section>;
};

const Content = (props: { content: FormContent; type: 'parent' | 'child' }) => {
    const { content, type } = props;
    return (
        <section className="setting" id={content.id} key={content.id}>
            {type === 'parent' ? <h1>{content.title}</h1> : <h2>{content.title}</h2>}
            <div className="description">{content.description}</div>
            {content.component}
        </section>
    );
};

export const NavigableForm = (props: NavigableFormProps) => {
    return (
        <>
            <Nav sections={props.sections} />
            <FormBody sections={props.sections} />
        </>
    );
};

export const createGroupSection = (contents: FormContent[]): GroupSection => {
    return {
        type: 'group',
        contents,
    };
};

export const createSection = (content: FormContent): ItemSection => {
    return {
        type: 'item',
        content,
    };
};
