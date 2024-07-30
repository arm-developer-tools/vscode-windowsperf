/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import {
    RecordOptionsValidationResult,
    buildEventsParameter,
    buildRecordArgs,
    validateRecordOptions,
} from './record-options';
import { eventAndFrequencyFactory, recordOptionsFactory } from './record-options.factories';

describe('validateRecordOptions', () => {
    it('returns valid when all fields are set', () => {
        const got = validateRecordOptions(
            recordOptionsFactory({
                events: [eventAndFrequencyFactory()],
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
                events: [eventAndFrequencyFactory()],
                command: '',
            }),
        );

        const want: RecordOptionsValidationResult = { missingFields: ['command'] };
        expect(got).toEqual(want);
    });
});

describe('buildEventsParameter', () => {
    it('builds the events parameter for a single event with the default frequency', () => {
        const got = buildEventsParameter([{ event: 'ld_spec' }]);

        expect(got).toBe('ld_spec');
    });

    it('builds the events parameter for a single event with a specific frequency', () => {
        const got = buildEventsParameter([{ event: 'ld_spec', frequency: 100000 }]);

        expect(got).toBe('ld_spec:100000');
    });

    it('builds the events parameter for a two events with the default frequency', () => {
        const got = buildEventsParameter([{ event: 'ld_spec' }, { event: 'st_spec' }]);

        expect(got).toBe('ld_spec,st_spec');
    });

    it('builds the events parameter for a two events with specific frequencies', () => {
        const got = buildEventsParameter([
            { event: 'ld_spec', frequency: 100000 },
            { event: 'st_spec', frequency: 200000 },
        ]);

        expect(got).toBe('ld_spec:100000,st_spec:200000');
    });

    it('builds the events parameter for a three events, two with specific frequencies and one with the default', () => {
        const got = buildEventsParameter([
            { event: 'ld_spec', frequency: 100000 },
            { event: 'l2d_cache_rd' },
            { event: 'st_spec', frequency: 200000 },
        ]);

        expect(got).toBe('ld_spec:100000,l2d_cache_rd,st_spec:200000');
    });
});

describe('buildRecordArgs', () => {
    it('concatenates events and the frequency', () => {
        const events = [eventAndFrequencyFactory(), eventAndFrequencyFactory()];

        const got = buildRecordArgs(recordOptionsFactory({ events }));

        expect(got).toContain(buildEventsParameter(events));
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
