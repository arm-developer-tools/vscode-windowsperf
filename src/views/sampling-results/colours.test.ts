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
