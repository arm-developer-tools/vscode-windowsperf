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
import { logger } from './logger';
import { getLoggableError } from './printable-error';

export const logErrorAndNotify = (error: unknown, notificationMessage: string) => {
    const loggableError = getLoggableError(error);
    logger.error(loggableError);

    vscode.window
        .showErrorMessage(
            `${notificationMessage} See the log for more information.`,
            'Open Log',
            'Check WindowsPerf Installation',
        )
        .then((result) => {
            if (result === 'Open Log') {
                logger.show(true);
            }
            if (result === 'Check WindowsPerf Installation') {
                vscode.commands.executeCommand('windowsperf.systemCheck');
            }
        });
};
