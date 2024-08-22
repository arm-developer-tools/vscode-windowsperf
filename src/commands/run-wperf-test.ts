/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { runTestAsText } from '../wperf/run';
import { ProgressLocation } from 'vscode';
import { logErrorAndNotify } from '../logging/error-logging';
import { logger } from '../logging/logger';
import wrap from 'wrap-ansi';

export const WRAP_LENGTH = 300;

export class RunWperfTest {
    constructor(
        private readonly runWperfTest: typeof runWperfTestWithProgress = runWperfTestWithProgress,
    ) {}

    execute = async () => {
        logger.info('Executing windowsperf.runWperfTest');
        const statusInfo = await this.runWperfTest();
        if (statusInfo) {
            logger.info('\n' + wrap(statusInfo, WRAP_LENGTH));
            logger.show(true);
        }
    };
}

export const runWperfTestWithProgress = async (): Promise<string | undefined> => {
    try {
        return vscode.window.withProgress(
            {
                title: 'Running wperf test',
                location: ProgressLocation.Notification,
                cancellable: true,
            },
            (_progress, cancellationToken) => runTestAsText(cancellationToken),
        );
    } catch (e) {
        const error = e as Error;
        logErrorAndNotify(error.message, 'Failed to run wperf test.');
        return undefined;
    }
};
