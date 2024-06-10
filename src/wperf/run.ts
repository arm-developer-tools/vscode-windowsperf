/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { Sample, parseListJson, parseSampleJson } from './parse';
import { CancellationToken } from 'vscode';
import { exec } from '../node/process';

export type RecordOptions = {
    events: string[];
    frequency: number;
    core: number;
    command: string;
    timeoutSeconds: number | undefined;
};

const shellEscape = (input: string): string => `"${input}"`;

export const buildRecordArgs = (options: RecordOptions): string => {
    const eventsArg = options.events.join(',') + ':' + options.frequency.toString();
    const timeoutArgs = options.timeoutSeconds === undefined ? [] : ['--timeout', options.timeoutSeconds.toString()];

    return [
        'record',
        '-e', eventsArg,
        '-c', options.core.toString(),
        ...timeoutArgs,
        '--json',
        '--disassemble',
        '--',
        options.command,
    ].join(' ');
};

export const buildRecordCommand = (executablePath: string, options: RecordOptions): string => {
    const args = buildRecordArgs(options);
    return `${shellEscape(executablePath)} ${args}`;
};

export const buildListCommand = (executablePath: string) => `${shellEscape(executablePath)} list --json`;

const getExecutable = (): string => vscode.workspace.getConfiguration('windowsPerf').get('wperfPath') || 'wperf';
const getCwd = (): string | undefined => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || undefined;

const run = async (command: string, cancellationToken?: CancellationToken): Promise<string> => {
    const cwd = getCwd();
    const { stdout } = await exec(command, { cwd }, cancellationToken);
    return stdout;
};

export const runRecord = async (options: RecordOptions, cancellationToken?: CancellationToken): Promise<Sample> => {
    const args = buildRecordCommand(getExecutable(), options);
    const resultJson = await run(args, cancellationToken);
    return parseSampleJson(resultJson);
};

export const runList = async (cancellationToken?: CancellationToken): Promise<string[]> => {
    const resultJson = await run(buildListCommand(getExecutable()), cancellationToken);
    return parseListJson(resultJson).Predefined_Events.map(event => event.Alias_Name);
};
