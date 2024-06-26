/*
 * Copyright (c) 2024 Arm Limited
 */

import { generateTimeStamp } from './date';

describe('generateTimeStamp', () => {
    it('get the current date as YY-MM-DD, hr:min:sec (AM|PM)', () => {
        const date = generateTimeStamp();
        expect(date).toMatch(
            new RegExp('^\\d{4}-\\d{1,2}-\\d{1,2}, \\d{1,2}:\\d{2}:\\d{2}(?: (?:AM|PM))?$'),
        );
    });
});
