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

import vscode from 'vscode';
import { logger } from '../logging/logger';
import { logErrorAndNotify, openLogButton } from '../logging/error-logging';
import { getWperfVersion } from './system-check';

const compatibleWperfVersion: string = '3.8.0';

const getCheckVersionCompatibiltyConfig = (): boolean => {
    return vscode.workspace.getConfiguration().get('windowsPerf.checkVersionCompatibility', true);
};

export const hasCompatibleVersion = async (
    checkWperfVersion = getWperfVersion,
    hasEnabledVersionCompatibilityCheck = getCheckVersionCompatibiltyConfig,
): Promise<boolean> => {
    if (!hasEnabledVersionCompatibilityCheck()) {
        return true;
    }

    const installedVersion = await checkWperfVersion();
    const compatible = installedVersion === compatibleWperfVersion;
    logger.info(
        `Found: ${installedVersion} Required: ${compatibleWperfVersion} Compatible? ${compatible}`,
    );
    return compatible;
};

export const displayDisableVersionCheckNotification = () => {
    const message = 'Incompatible wperf.exe version.';
    logErrorAndNotify(message, message, [
        openLogButton,
        {
            name: 'Allow Incompatible Versions',
            callback: disableVersionCompatibilityCheck,
        },
    ]);
};

export const disableVersionCompatibilityCheck = async (): Promise<boolean> => {
    vscode.window.showWarningMessage(
        "WARNING: Disabling the version compatibility check may lead to unintended behaviours. You can re-enable it at any time in the extension's settings.",
        'Okay',
    );
    await vscode.workspace
        .getConfiguration()
        .update('windowsPerf.checkVersionCompatibility', false);
    return true;
};
