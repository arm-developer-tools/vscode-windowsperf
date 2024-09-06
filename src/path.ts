/**
 * Copyright (C) 2024 Arm Limited
 */

import path from 'path';
import { access, constants } from 'fs/promises';

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

export const checkLlvmObjDumpOnPath = async (
    platform: NodeJS.Platform,
    processEnvPath: string | undefined,
): Promise<boolean> => {
    if (platform !== 'win32') {
        return false;
    }
    return checkFileExistsOnPath(processEnvPath, 'llvm-objdump.EXE');
};
