/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { buildListCommand, buildRecordCommand, buildTestCommand } from './run';
import { buildRecordArgs } from './record-options';
import { faker } from '@faker-js/faker';
import { recordOptionsFactory } from './record-options.factories';

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

describe('buildTestCommand', () => {
    it('escapes the executable and returns the correct arguments', () => {
        const executablePath = faker.system.filePath();

        const got = buildTestCommand(executablePath);

        expect(got).toEqual(`"${executablePath}" test`);
    });
});
