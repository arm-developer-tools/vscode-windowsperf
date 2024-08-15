/**
 * Copyright (C) 2024 Arm Limited
 */

export const canEnableWindowsOnArmFeatures = (
    platform: string,
    arch: string,
    wperfPath?: string,
) => {
    const isWindowsOnArm = platform === 'win32' && (arch === 'arm' || arch === 'arm64');
    const wperfPathConfig = wperfPath || '';

    return isWindowsOnArm || wperfPathConfig.length > 0;
};
