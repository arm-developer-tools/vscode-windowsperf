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
});
