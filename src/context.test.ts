/**
 * Copyright (C) 2024 Arm Limited
 */

import { canEnableWindowsOnArmFeatures, ContextManager } from './context';

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

describe('ContextManager', () => {
    it('configures the context', () => {
        const getConfig = jest.fn();
        const updateContext = jest.fn();

        new ContextManager(updateContext, getConfig);

        expect(updateContext).toHaveBeenCalledTimes(2);
        expect(getConfig).toHaveBeenCalledTimes(1);
        expect(updateContext).toHaveBeenCalledWith(
            'windowsperf.hasWindowsOnArmFeatures',
            expect.any(Boolean),
        );
        expect(updateContext).toHaveBeenCalledWith('windowsperf.initialised', true);
    });

    it('handleConfigurationChange to be called by wperfPath', () => {
        const getConfig = jest.fn();
        const updateContext = jest.fn();
        const mockEvent = jest.fn();

        const contextManager = new ContextManager(updateContext, getConfig);
        contextManager.handleConfigurationChange({
            affectsConfiguration: mockEvent,
        });

        expect(mockEvent).toHaveBeenCalledWith('windowsPerf.wperfPath');
    });
});
