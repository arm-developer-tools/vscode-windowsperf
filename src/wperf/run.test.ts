/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { buildListCommand, buildRecordArgs, buildRecordCommand } from './run';
import { faker } from '@faker-js/faker';
import { recordOptionsFactory } from './record-options.factories';

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
});

describe('buildRecordCommand', () => {
    it('escapes the executable and returns the correct arguments', () => {
        const executablePath = faker.system.filePath();
        const options = recordOptionsFactory();

        const got = buildRecordCommand(executablePath, options);

        const want = `"${executablePath}" ${buildRecordArgs(options)}`;
        expect(got).toEqual(want);
    });
});

describe('buildListCommand', () => {
    it('escapes the executable and returns the correct arguments', () => {
        const executablePath = faker.system.filePath();

        const got = buildListCommand(executablePath);

        expect(got).toEqual(`"${executablePath}" list -v --json`);
    });
});
