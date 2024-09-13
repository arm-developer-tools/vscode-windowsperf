/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { logger } from './logger';
import { getLoggableError } from './printable-error';

export const logErrorAndNotify = (error: unknown, notificationMessage: string) => {
    const loggableError = getLoggableError(error);
    logger.error(loggableError);

    vscode.window
        .showErrorMessage(
            `${notificationMessage} See the log for more information.`,
            'Open Log',
            'Run System Check',
        )
        .then((result) => {
            if (result === 'Open Log') {
                logger.show(true);
            }
            if (result === 'Run System Check') {
                vscode.commands.executeCommand('windowsperf.systemCheck');
            }
        });
};
