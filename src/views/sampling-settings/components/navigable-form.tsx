/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { RecordButton } from './record-button';

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
                <>
                    <h2 id={section.id}>{section.title}</h2>
                    {section.component.contents.map((content) => {
                        return <Content content={content} type={section.component.type} />;
                    })}
                </>
            );
        } else {
            return <Content content={section.component.content} type={section.component.type} />;
        }
    });
    return <section className="content">{content}</section>;
};

const Content = (props: { content: FormContent; type: 'group' | 'item' }) => {
    const { content, type } = props;
    return (
        <section className="setting" id={content.id} key={content.id}>
            {type === 'group' ? <h1>{content.title}</h1> : <h2>{content.title}</h2>}
            <div className="description">{content.description}</div>
            {content.component}
        </section>
    );
};

export const NavigableForm = (props: NavigableFormProps) => {
    return (
        <>
            <Nav sections={props.sections} record={props.record} />
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
