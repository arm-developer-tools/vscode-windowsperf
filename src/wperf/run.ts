/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { CancellationToken } from 'vscode';
import { exec } from '../node/process';
import { Sample, parseRecordJson } from './parse/record';
import { PredefinedEvent, parseListJson } from './parse/list';
import { RecordOptions } from './record-options';
import { buildRecordArgs } from './record-options';
import { parseTestJson, TestResults } from './parse/test';

const shellEscape = (input: string): string => `"${input}"`;

export const buildRecordCommand = (
    executablePath: string,
    options: RecordOptions,
    forceLock: boolean,
): string => {
    const args = buildRecordArgs(options, forceLock);
    return `${shellEscape(executablePath)} ${args}`;
};

export const buildListCommand = (executablePath: string) =>
    `${shellEscape(executablePath)} list -v --json`;

export const buildTestAsTextCommand = (executablePath: string) =>
    `${shellEscape(executablePath)} test`;
const buildTestCommand = (executablePath: string) =>
    `${buildTestAsTextCommand(executablePath)} --json`;

export const getExecutable = (): string =>
    vscode.workspace.getConfiguration('windowsPerf').get('wperfPath') || 'wperf';
const getCwd = (): string | undefined =>
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || undefined;

const run = async (command: string, cancellationToken?: CancellationToken): Promise<string> => {
    const cwd = getCwd();
    const { stdout } = await exec(command, { cwd }, cancellationToken);
    return stdout;
};

export const runRecord = async (
    options: RecordOptions,
    forceLock: boolean,
    cancellationToken?: CancellationToken,
): Promise<Sample> => {
    const args = buildRecordCommand(getExecutable(), options, forceLock);
    const resultJson = await run(args, cancellationToken);
    return parseRecordJson(resultJson);
};

export const runList = async (
    cancellationToken?: CancellationToken,
): Promise<PredefinedEvent[]> => {
    const resultJson = await run(buildListCommand(getExecutable()), cancellationToken);
    return parseListJson(resultJson);
};

export const runTestAsText = async (cancellationToken?: CancellationToken): Promise<string> => {
    return await run(buildTestAsTextCommand(getExecutable()), cancellationToken);
};

export const runTestAndParse = async (
    cancellationToken?: CancellationToken,
): Promise<TestResults> => {
    const resultJson = await run(buildTestCommand(getExecutable()), cancellationToken);
    return parseTestJson(resultJson);
};
