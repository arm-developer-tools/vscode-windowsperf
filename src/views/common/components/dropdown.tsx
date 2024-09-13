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
import { ReactNode } from 'react';
import * as Prime from 'primereact/dropdown';
import './dropdown.css';

// Omit options that are not yet supported by our styles
type UnsupportedOptions =
    | 'appendTo'
    | 'variant'
    | 'editable'
    | 'highlightOnSelect'
    | 'checkmark'
    | 'loading'
    | 'showClear'
    | 'children'
    | 'pt'
    | 'ptOptions'
    | 'unstyled'
    | 'value'
    | 'options'
    | 'optionGroupChildren'
    | 'optionGroupLabel';

export type OptionGroup<O> = {
    label?: string;
    options: O[];
};

// Use a generic Item to improve the interface to our Dropdown component over Prime's version
type CustomProps<
    ValueKey extends string,
    LabelKey extends string,
    Option extends Record<ValueKey | LabelKey, string>,
> = {
    itemTemplate?: ReactNode | ((option: Option) => ReactNode);
    valueTemplate?: ReactNode | ((option: Option) => ReactNode) | undefined;
    optionGroupTemplate?:
        | ReactNode
        | ((option: OptionGroup<Option>, index: number) => ReactNode)
        | undefined;
    value: string;
    options: OptionGroup<Option>[];
    optionLabel: LabelKey;
    optionValue: ValueKey;
    onChange: (value: string) => void;
};

export type DropdownProps<
    ValueKey extends string,
    LabelKey extends string,
    Option extends Record<ValueKey | LabelKey, string>,
> = Omit<Prime.DropdownProps, UnsupportedOptions | keyof CustomProps<ValueKey, LabelKey, Option>> &
    CustomProps<ValueKey, LabelKey, Option>;

export const Dropdown = function <
    V extends string,
    L extends string,
    I extends Record<V | L, string>,
>(props: DropdownProps<V, L, I>) {
    const { onChange, ...dropdownProps } = props;
    const className = `dropdown ${props.placeholder && !props.value ? 'has-placeholder' : ''} ${props.invalid ? 'invalid' : ''} ${props.className ?? ''}`;

    return (
        <Prime.Dropdown
            {...dropdownProps}
            className={className}
            onChange={(e) => onChange(e.value)}
            optionGroupLabel="label"
            optionGroupChildren="options"
            pt={{
                input: { className: 'dropdown-input' },
                itemGroup: { className: 'dropdown-item-group' },
                panel: { className: 'dropdown-panel' },
                trigger: { className: 'dropdown-trigger' },
                wrapper: { className: 'dropdown-wrapper' },
                list: { className: 'dropdown-list' },
                item: { className: 'dropdown-item' },
                itemLabel: { className: 'dropdown-item-label' },
                filterContainer: { className: 'dropdown-filter-container' },
                filterIcon: { className: 'dropdown-filter-icon' },
                filterInput: { className: 'dropdown-filter-input' },
            }}
        />
    );
};
