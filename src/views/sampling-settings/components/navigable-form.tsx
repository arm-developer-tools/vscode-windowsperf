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
    tooltip?: string;
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
                            <span
                                className={`invalid super-impose ${section.invalid ? 'visible' : 'hidden'}`}
                            >
                                *
                            </span>
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
        <section
            className={`setting ${content.invalid ? 'invalid' : ''}`}
            id={content.id}
            key={content.id}
        >
            {type === 'parent' ? <h1>{content.title}</h1> : <h2>{content.title}</h2>}
            <div className="description">
                {content.description}
                {content.tooltip && (
                    <span
                        className="codicon codicon-info information-tooltip"
                        role="tooltip"
                        title={content.tooltip}
                    ></span>
                )}
            </div>
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
