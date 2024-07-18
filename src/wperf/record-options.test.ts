/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import {
    RecordOptionsValidationResult,
    buildRecordArgs,
    validateRecordOptions,
} from './record-options';
import { recordOptionsFactory } from './record-options.factories';

describe('validateRecordOptions', () => {
    it('returns valid when all fields are set', () => {
        const got = validateRecordOptions(
            recordOptionsFactory({
                events: ['event1'],
                command: 'my-command',
            }),
        );

        const want: RecordOptionsValidationResult = { missingFields: [] };
        expect(got).toEqual(want);
    });

    it('returns missingFields when events is empty', () => {
        const got = validateRecordOptions(
            recordOptionsFactory({
                events: [],
                command: 'my-command',
            }),
        );

        const want: RecordOptionsValidationResult = { missingFields: ['events'] };
        expect(got).toEqual(want);
    });

    it('returns missingFields when command is empty', () => {
        const got = validateRecordOptions(
            recordOptionsFactory({
                events: ['event1'],
                command: '',
            }),
        );

        const want: RecordOptionsValidationResult = { missingFields: ['command'] };
        expect(got).toEqual(want);
    });
});

describe('buildRecordArgs', () => {
    it('concatenates events and the frequency', () => {
        const got = buildRecordArgs(
            recordOptionsFactory({
                events: ['event1', 'event2'],
                frequency: 100,
            }),
        );

        expect(got).toContain('event1,event2:100');
    });

    it('includes the timeout argument if it is provided', () => {
        const got = buildRecordArgs(
            recordOptionsFactory({
                timeoutSeconds: 10,
            }),
        );

        expect(got).toContain('--timeout 10');
    });

    it('does not include the timeout argument if it is not provided', () => {
        const got = buildRecordArgs(
            recordOptionsFactory({
                timeoutSeconds: undefined,
            }),
        );

        expect(got).not.toContain('--timeout');
    });

    it('includes the core', () => {
        const got = buildRecordArgs(
            recordOptionsFactory({
                core: 1,
            }),
        );

        expect(got).toContain('-c 1');
    });

    it('includes the command', () => {
        const got = buildRecordArgs(
            recordOptionsFactory({
                command: 'test command',
            }),
        );

        expect(got).toContain('test command');
    });

    it('includes the arguments', () => {
        const got = buildRecordArgs(
            recordOptionsFactory({
                arguments: '--some-flag',
            }),
        );

        expect(got).toContain('--some-flag');
    });
});
