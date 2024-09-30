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

export type NotificationButton = {
    name: string;
    callback: () => void;
};

export const openLogButton: NotificationButton = {
    name: 'Open Log',
    callback: () => logger.show(true),
};

export const checkInstallationButton: NotificationButton = {
    name: 'Check WindowsPerf Installation',
    callback: () => vscode.commands.executeCommand('windowsperf.systemCheck'),
};

export const defaultButtons: NotificationButton[] = [openLogButton, checkInstallationButton];

export const logErrorAndNotify = (
    error: unknown,
    notificationMessage: string,
    buttons = defaultButtons,
) => {
    const loggableError = getLoggableError(error);
    logger.error(loggableError);

    vscode.window
        .showErrorMessage(
            `${notificationMessage} See the log for more information.`,
            ...buttons.map((btn) => btn.name),
        )
        .then((result) => {
            const button = buttons.find((btn) => btn.name === result);
            if (button) {
                button.callback();
            }
        });
};
