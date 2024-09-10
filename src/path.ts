/**
 * Copyright (C) 2024 Arm Limited
 */

import path from 'path';
import { access, constants } from 'fs/promises';
import { getExecutable } from './wperf/run';

export const isSamePath = (p1: string, p2: string): boolean => {
    return path.relative(p1, p2) === '';
};

export const checkFileExistsOnPath = async (
    processEnvPath: string | undefined,
    fileToCheck: string,
): Promise<boolean> => {
    if (!processEnvPath) {
        return false;
    }
    const splitPaths = processEnvPath.split(path.delimiter);
    for (let i = 0; i < splitPaths.length; i++) {
        const current = splitPaths[i];
        if (!current) {
            continue;
        }
        const joinedPath = path.join(current, fileToCheck);
        const validFile = await checkHasFileAccess(joinedPath);
        if (validFile) {
            return true;
        }
    }

    return false;
};

export const checkHasFileAccess = async (path: string) => {
    try {
        await access(path, constants.R_OK | constants.W_OK);
        return true;
    } catch {
        return false;
    }
};

export const checkFileExistsOnPathOnWindowsOnly = async (
    platform: NodeJS.Platform,
    processEnvPath: string | undefined,
    fileToCheck: string,
): Promise<boolean> => {
    if (platform !== 'win32') {
        return false;
    }
    return checkFileExistsOnPath(processEnvPath, fileToCheck);
};

export const checkLlvmObjDumpOnPath = (): Promise<boolean> => {
    return checkFileExistsOnPathOnWindowsOnly(
        process.platform,
        process.env?.['PATH'],
        'llvm-objdump.EXE',
    );
};

export const checkWperfExistsInSettingsOrPath = async (
    getWperfPath: typeof getExecutable = getExecutable,
    checkPath: typeof checkFileExistsOnPathOnWindowsOnly = checkFileExistsOnPathOnWindowsOnly,
): Promise<boolean> => {
    const executableName = 'wperf.exe';
    const wperfPath = getWperfPath();
    if (wperfPath === 'wperf') {
        return await checkPath(process.platform, process.env?.['PATH'], executableName);
    } else {
        return wperfPath.includes(executableName);
    }
};
