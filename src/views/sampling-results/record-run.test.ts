/*
 * Copyright (c) 2024 Arm Limited
 */

import { sampleFactory } from '../../wperf/parse.factories';
import { RecordRun } from './record-run';

describe('RecordRun', () => {
    describe('displayName', () => {
        it('returns the wperf command label', () => {
            const commandLabel = 'wperf -record';
            const run = new RecordRun(commandLabel, sampleFactory());

            expect(run.displayName).toEqual(commandLabel);
        });
    });

    describe('displayLog', () => {
        it('returns the wperf command log', () => {
            const commandLabel = 'wperf -record';
            const run = new RecordRun(commandLabel, sampleFactory());

            expect(run.displayLog).toEqual(commandLabel);
        });
    });

    describe('date', () => {
        it('returns the timestamp of the current date and time', () => {
            const want = new RegExp('^\\d{4}-\\d{1,2}-\\d{1,2}, \\d{1,2}:\\d{2}:\\d{2} (AM|PM)$');
            const run = new RecordRun('', sampleFactory());

            expect(run.date).toMatch(want);
        });
    });
});
