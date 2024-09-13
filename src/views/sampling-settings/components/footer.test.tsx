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

import 'jest';
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { recordOptionsFactory } from '../../../wperf/record-options.factories';
import { Footer } from './footer';
import { buildRecordArgs } from '../../../wperf/record-options';

describe('Footer', () => {
    it('renders the wperf command line', () => {
        const recordOptions = recordOptionsFactory();

        render(<Footer recordOptions={recordOptions} record={jest.fn()} />);

        expect(
            screen.queryByText(buildRecordArgs(recordOptions, false), { exact: false }),
        ).toBeInTheDocument();
    });
    it('calls record when the record event button is clicked', () => {
        const recordOptions = recordOptionsFactory();
        const record = jest.fn();
        render(<Footer record={record} recordOptions={recordOptions} />);

        const recordButton = screen.getAllByText('Record');
        fireEvent.click(recordButton[0]!);

        expect(record).toHaveBeenCalled();
    });
});
