/*
 * Copyright (c) 2024 Arm Limited
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
