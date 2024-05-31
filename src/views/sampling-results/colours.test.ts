/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { textEditorColour, treeViewColour } from './colours';

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

describe('treeViewColour', () => {
    it.each([
        { numHits: 51, want: 'list.errorForeground' },
        { numHits: 30, want: 'list.warningForeground' },
    ])('$numHits returns colour $want', ({ numHits, want }) => {
        const got = treeViewColour(numHits);

        expect(got).toEqual(new vscode.ThemeColor(want));
    });

    it('returns undefined when hits are below 10', () => {
        const got = treeViewColour(0);

        expect(got).toBeUndefined();
    });
});
