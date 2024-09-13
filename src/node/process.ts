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

import { ExecException, ProcessEnvOptions, exec as cpExec } from 'child_process';
import { CancellationToken } from 'vscode';
import { logger } from '../logging/logger';
import { ctrlc } from '@arm-debug/ctrlc-windows';

export type ExecResult = {
    stdout: string;
    stderr: string;
};

const execAsPromise = async (
    command: string,
    options: ProcessEnvOptions = {},
    cancellationToken?: CancellationToken,
): Promise<ExecResult> => {
    return new Promise((resolve, reject) => {
        const childProcess = cpExec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });

        cancellationToken?.onCancellationRequested(() => {
            if (process.platform === 'win32' && childProcess.pid) {
                // Wperf listens to CTRL+C events to manually terminate the recording.
                // This is different from the behaviour of kill('SIGINT') on Windows, which force terminates the process.
                // https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/blob/2775034ab0ebed3a2e59741e2bf519ac05c8f28a/wperf/main.cpp#L61-74
                ctrlc(childProcess.pid);
            } else {
                childProcess.kill('SIGINT');
            }
        });
    });
};

const logCommandAndResult = (command: string, result: Partial<ExecResult>) => {
    logger.info(`> ${command}`);
    if (result.stderr) {
        logger.debug(result.stderr.trim());
    }
    if (result.stdout) {
        logger.trace(result.stdout.trim());
    }
};

export const exec = async (
    command: string,
    options: ProcessEnvOptions = {},
    cancellationToken?: CancellationToken,
): Promise<ExecResult> => {
    cancellationToken?.onCancellationRequested(() => {
        logger.debug(`Cancellation requested for command: ${command}`);
    });

    try {
        const result = await execAsPromise(command, options, cancellationToken);
        logCommandAndResult(command, result);
        return result;
    } catch (error: unknown) {
        const execException = error as ExecException;
        logCommandAndResult(command, execException);
        logger.info(execException.message);
        if (execException.code) {
            logger.info(`Command failed with code ${execException.code}`);
        }
        throw error;
    }
};
