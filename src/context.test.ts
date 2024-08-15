/**
 * Copyright (C) 2024 Arm Limited
 */

import { canEnableWindowsOnArmFeatures } from './context';

describe('context', () => {
    it.each`
        arch       | platform    | mockpath     | expected
        ${'arm64'} | ${'win32'}  | ${''}        | ${true}
        ${'arm'}   | ${'win32'}  | ${''}        | ${true}
        ${'x64'}   | ${'win32'}  | ${''}        | ${false}
        ${'arm64'} | ${'darwin'} | ${''}        | ${false}
        ${'arm64'} | ${'darwin'} | ${'path'}    | ${true}
        ${'arm64'} | ${'darwin'} | ${undefined} | ${false}
    `(
        'checkPlatformArch - $arch, $platform $mockpath',
        ({ arch, platform, mockpath, expected }) => {
            const res = canEnableWindowsOnArmFeatures(platform, arch, mockpath);

            expect(res).toBe(expected);
        },
    );
});
