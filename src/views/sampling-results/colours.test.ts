/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { textEditorColour, treeViewColour } from './colours';

describe('textEditorColour', () => {
    it.each([
        { numHits: 72, want: 'rgba(255, 0, 0, 0.2)' },
        { numHits: 35.4, want: 'rgba(255, 255, 0, 0.2)' },
        { numHits: 0.1, want: 'rgba(100, 100, 100, 0.2)' },
    ])('$numHits returns colour $want', ({ numHits, want }) => {
        const got = textEditorColour(numHits);

        expect(got).toEqual(want);
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
