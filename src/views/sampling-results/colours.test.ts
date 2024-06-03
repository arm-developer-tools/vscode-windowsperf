/*
 * Copyright (c) 2024 Arm Limited
 */

import { textEditorColour } from './colours';

describe('textEditorColour', () => {
    it('returns different RGB colour depending on overhead value', () => {
        const minRange = 0;
        const maxRange = 100;
        let previous: string = '';
        for (let overhead = minRange; overhead < maxRange; overhead++) {
            const got = textEditorColour(overhead);
            expect(got).toContain('rgb');
            expect(got).not.toBe(previous);
            previous = got;
        }
    });
});
