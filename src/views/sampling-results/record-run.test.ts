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

import { sampleFactory } from '../../wperf/parse/record.factories';
import { recordOptionsFactory } from '../../wperf/record-options.factories';
import { RecordRun } from './record-run';

describe('RecordRun', () => {
    describe('displayName', () => {
        it('returns the wperf command label', () => {
            const commandLabel = 'wperf -record';

            const run = new RecordRun(
                recordOptionsFactory({ command: commandLabel }),
                sampleFactory(),
            );

            expect(run.displayName).toEqual(commandLabel);
        });
    });

    describe('displayLog', () => {
        it('returns the wperf command log', () => {
            const commandLabel = 'wperf -record';

            const run = new RecordRun(
                recordOptionsFactory({ command: commandLabel }),
                sampleFactory(),
            );

            expect(run.displayLog).toEqual(commandLabel);
        });
    });

    describe('date', () => {
        it('returns the timestamp of the current date and time', () => {
            const want = new RegExp(
                '^\\d{4}-\\d{1,2}-\\d{1,2}, \\d{1,2}:\\d{2}:\\d{2}(?: (?:AM|PM))?$',
            );
            const run = new RecordRun(recordOptionsFactory(), sampleFactory());

            expect(run.date).toMatch(want);
        });
    });
});
