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

import { it } from '@jest/globals';
import { formatFraction, percentage } from './math';

describe('percentage', () => {
    it.each([
        { value: 20, total: 100, want: 20 },
        { value: 4, total: 8, want: 50 },
        { value: 15, total: 128, want: 11.71875 },
    ])('$value of $total is $want%', ({ value, total, want }) => {
        const got = percentage(value, total);

        expect(got).toEqual(want);
    });
});

describe('formatFraction', () => {
    it('formats given float to requested number of digits', () => {
        const got = formatFraction(10.12345, 2);

        const want = 10.12;
        expect(got).toEqual(want);
    });
});
