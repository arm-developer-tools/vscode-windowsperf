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
