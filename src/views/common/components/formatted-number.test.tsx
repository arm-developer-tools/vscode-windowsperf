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
import 'jest';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { FormattedNumber } from './formatted-number';

describe('Formatted Number', () => {
    it('formats value correctly using Intl number format', () => {
        const numberToFormat = 1000000;
        const { container } = render(<FormattedNumber value={numberToFormat} />);

        expect(container.textContent).toBe(new Intl.NumberFormat().format(numberToFormat));
    });
});
