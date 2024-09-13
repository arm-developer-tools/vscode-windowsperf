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

import * as vscode from 'vscode';
import { CancellationToken } from 'vscode';
import { exec } from '../node/process';
import { Sample, parseRecordJson } from './parse/record';
import { PredefinedEvent, parseListJson } from './parse/list';
import { RecordOptions } from './record-options';
import { buildRecordArgs } from './record-options';
import { parseTestJson, TestResults } from './parse/test';
import { parseVersionJson, Version } from './parse/version';

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

const buildVersionCommand = (executablePath: string) =>
    `${shellEscape(executablePath)} --version --json`;

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

export const runVersionAndParse = async (
    cancellationToken?: CancellationToken,
): Promise<Version[]> => {
    const resultJson = await run(buildVersionCommand(getExecutable()), cancellationToken);
    return parseVersionJson(resultJson);
};

export const runTestAndParse = async (
    cancellationToken?: CancellationToken,
): Promise<TestResults> => {
    const resultJson = await run(buildTestCommand(getExecutable()), cancellationToken);
    return parseTestJson(resultJson);
};
