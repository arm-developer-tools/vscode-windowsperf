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

import { checkLlvmObjDumpOnPath } from '../path';
import { runVersionAndParse } from '../wperf/run';
import { SystemCheckValues } from './system-check-values';
import { logger } from '../logging/logger';
import wrap from 'wrap-ansi';
import { exec } from '../node/process';
import * as vscode from 'vscode';

type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

export const getSystemCheckData = async (
    platform: NodeJS.Platform,
    arch: NodeJS.Architecture,
    checkLlvmObjDump = checkLlvmObjDumpOnPath,
    runDriverCheck = runWindowsDriverCheck,
    runVersionWithParse = runVersionAndParse,
): Promise<SystemCheckValues> => {
    const hasLlvmObjDumpOnPath = await checkLlvmObjDump();
    const wperfCommandAvailable = await hasWperfOnPath(runVersionWithParse);
    const hasWperfDriver = await getWperfDriver(platform, runDriverCheck);

    return {
        isWindowsOnArm: {
            name: 'Windows-on-Arm host',
            description:
                'Windows running on an Arm CPU is required for WindowsPerf to record performance.',
            isFound: platform === 'win32' && (arch === 'arm' || arch === 'arm64'),
        },
        isWperfInstalled: {
            name: 'WPerf command available',
            description:
                'This is required to run the commands used in this extension. Learn more https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/blob/main/INSTALL.md or specify the absolute path to the WindowsPerf executable in the VSCode extension settings.',
            isFound: wperfCommandAvailable,
        },
        isWperfDriverInstalled: {
            name: 'WPerf driver installed',
            description:
                'The driver is required to run WindowsPerf. Learn more https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/blob/main/wperf-devgen/README.md#driver-installation.',
            isFound: hasWperfDriver,
        },
        hasLlvmObjDumpOnPath: {
            name: 'llvm-objdump on PATH',
            description:
                'The --disassemble option requires llvm-objdump to be on your PATH. Learn more https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/tree/main/wperf?ref_type=heads#using-the-disassemble-option.',
            isFound: hasLlvmObjDumpOnPath,
        },
    };
};

export const getWperfVersion = async (
    runVersionWithParse = runVersionAndParse,
): Promise<string> => {
    const versionJson = await runVersionWithParse();
    const wperfComponent = versionJson.find((a) => a.Component === 'wperf');
    if (!wperfComponent) {
        throw new Error('No wperf version component found');
    }

    return wperfComponent.Version;
};

export const hasWperfOnPath = async (
    runVersionWithParse = runVersionAndParse,
): Promise<boolean> => {
    try {
        await runVersionWithParse();
        return true;
    } catch (error) {
        return false;
    }
};

export const getWperfDriver = async (
    platform: NodeJS.Platform,
    runDriverCheck = runWindowsDriverCheck,
): Promise<boolean> => {
    if (platform !== 'win32') {
        return false;
    }
    try {
        const drivers = await runDriverCheck();
        return drivers.includes('WPERFDRIVER');
    } catch (error) {
        return false;
    }
};

export const generateSystemCheck = async () => {
    const systemCheckInfo = await vscode.window.withProgress(
        {
            title: 'Checking WindowsPerf installation',
            location: vscode.ProgressLocation.Notification,
            cancellable: false,
        },
        () => getSystemCheckData(process.platform, process.arch),
    );

    if (systemCheckInfo) {
        const { successList, failedList } = systemMessage(systemCheckInfo);
        const heading = `Check WindowsPerf Installation results:\n`;
        const notFoundList = `${failedList.length > 0 ? `${failedList}` : ''}`;
        const okList = `${successList.length > 0 ? `${successList}` : ''}`;
        const learnMoreLink = `Note: Failure of these checks does not impede the ability to open sample files recorded on other systems.\nInstallation and documentation can be found at https://learn.arm.com/install-guides/wperf/`;

        logger.info(wrap(`${heading}${notFoundList}${okList}${learnMoreLink}`, 150));
        logger.show(true);
    }
};

export const systemMessage = (systemCheckInfo: SystemCheckValues) => {
    let successList = '';
    let failedList = '';
    for (const [, value] of Object.entries(systemCheckInfo) as Entries<SystemCheckValues>) {
        const okLabel = `[OK] '${value.name}'`;
        const failLabel = `[FAIL] '${value.name}'`;
        const str = `${value.isFound ? okLabel : `${failLabel} \n${value.description}`}\n\n`;

        value.isFound ? (successList += str) : (failedList += str);
    }

    return {
        successList,
        failedList,
    };
};

export const runWindowsDriverCheck = async (): Promise<string> => {
    const { stdout } = await exec('driverquery /nh');
    return stdout;
};
