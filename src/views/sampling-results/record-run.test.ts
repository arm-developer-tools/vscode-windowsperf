/*
 * Copyright (c) 2024 Arm Limited
 */

import { sampleFactory } from '../../wperf/parse.factories';
import { RecordRun } from './record-run';

describe('RecordRun', () => {
    describe('id', () => {
        it('returns a valid uuid', () => {
            const command = 'wperf -record';
            const run1 = new RecordRun(command, sampleFactory());
            const run2 = new RecordRun(command, sampleFactory());

            expect(run1.id).not.toBeUndefined();
            expect(run2.id).not.toBeUndefined();
            expect(run1.id).not.toEqual(run2.id);
        });
    });

    describe('displayName', () => {
        it('returns the wperf command labed', () => {
            const commandLabel = 'wperf -record';
            const run = new RecordRun(commandLabel, sampleFactory());

            expect(run.displayName).toEqual(`Command: ${commandLabel}`);
        });
    });
});
