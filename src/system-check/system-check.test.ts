/**
 * Copyright (C) 2024 Arm Limited
 */

import { getSystemCheckData, getWperfDriver, getWperfVersion, systemMessage } from './system-check';
import { versionFactory } from '../wperf/parse/version.factories';
import { systemCheckValuesFactory } from './system-check.factories';

const mockWperfVersion = versionFactory({ Component: 'wperf' });

describe('RunSystemCheck', () => {
    describe('getWperfVersion', () => {
        it('returns correct version', async () => {
            const mockRunVersionAndParse = jest.fn();
            mockRunVersionAndParse.mockResolvedValue([
                mockWperfVersion,
                versionFactory({ Component: 'wperf-driver' }),
            ]);
            const res = await getWperfVersion(mockRunVersionAndParse);

            expect(res).toEqual(mockWperfVersion.Version);
        });

        it('returns undefined if call errors', async () => {
            const mockRunVersionAndParse = jest.fn();
            mockRunVersionAndParse.mockRejectedValueOnce(new Error('error'));
            const res = await getWperfVersion(mockRunVersionAndParse);

            expect(res).toEqual(undefined);
        });
    });

    describe('getWperfDriver', () => {
        it('returns true if is a windows machine and has the correct string response', async () => {
            const mockRunWindowsDriverCheck = jest.fn();
            mockRunWindowsDriverCheck.mockResolvedValueOnce('WPERFDRIVER Windows');
            const res = await getWperfDriver('win32', mockRunWindowsDriverCheck);

            expect(res).toEqual(true);
        });

        it('returns false WPERFDRIVER is not in the returned response', async () => {
            const mockRunWindowsDriverCheck = jest.fn();
            mockRunWindowsDriverCheck.mockResolvedValueOnce('something else');
            const res = await getWperfDriver('win32', mockRunWindowsDriverCheck);

            expect(res).toEqual(false);
        });

        it('returns both false if machine is not windows', async () => {
            const res = await getWperfDriver('darwin');

            expect(res).toEqual(false);
        });

        it('returns false if call errors', async () => {
            const mockRunWindowsDriverCheck = jest.fn();
            mockRunWindowsDriverCheck.mockRejectedValueOnce(new Error('error'));
            const res = await getWperfDriver('win32', mockRunWindowsDriverCheck);

            expect(res).toEqual(false);
        });
    });

    describe('getSystemCheckData', () => {
        it('returns complete output', async () => {
            const mockCheckLlvmObjDumpOnPath = jest.fn();
            mockCheckLlvmObjDumpOnPath.mockResolvedValue(true);
            const mockRunWindowsDriverCheck = jest.fn();
            mockRunWindowsDriverCheck.mockResolvedValueOnce('WPERFDRIVER Windows');
            const mockRunVersionAndParse = jest.fn();
            mockRunVersionAndParse.mockResolvedValue([
                mockWperfVersion,
                versionFactory({ Component: 'wperf-driver' }),
            ]);
            const res = await getSystemCheckData(
                'win32',
                'arm64',
                mockCheckLlvmObjDumpOnPath,
                mockRunWindowsDriverCheck,
                mockRunVersionAndParse,
            );

            expect(res).toEqual({
                hasLlvmObjDumpOnPath: {
                    name: 'llvm-objdump on PATH',
                    description:
                        'The --disassemble option requires llvm-objdump to be on your PATH. Learn more https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/tree/main/wperf?ref_type=heads#using-the-disassemble-option.',
                    isFound: true,
                },
                isWindowsOnArm: {
                    name: 'Windows-on-Arm host',
                    description:
                        'Windows running on an Arm CPU is required for WindowsPerf to record performance.',
                    isFound: true,
                },
                isWperfDriverInstalled: {
                    name: 'WPerf driver installed',
                    description:
                        'The driver is required to run WindowsPerf. Learn more https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/blob/main/wperf-devgen/README.md#driver-installation.',
                    isFound: true,
                },
                isWperfInstalled: {
                    name: 'WPerf command available',
                    description:
                        'This is required to run the commands used in this extension. Learn more https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/blob/main/INSTALL.md or specify the absolute path to the WindowsPerf executable in the VSCode extension settings.',
                    isFound: true,
                },
            });
        });
    });

    describe('systemMessage', () => {
        it('returns successList and failedList based on system check values', async () => {
            const values = systemCheckValuesFactory({
                isWindowsOnArm: {
                    name: 'woa name',
                    description: 'woa desc',
                    isFound: true,
                },
                isWperfDriverInstalled: {
                    name: 'wperf driver name',
                    description: 'wperf driver desc',
                    isFound: true,
                },
            });
            const res = systemMessage(values);

            expect(res).toEqual({
                successList: `[OK] 'woa name'\n\n[OK] 'wperf driver name'\n\n`,
                failedList: `[FAIL] '${values.hasLlvmObjDumpOnPath.name}' \n${values.hasLlvmObjDumpOnPath.description}\n\n[FAIL] '${values.isWperfInstalled.name}' \n${values.isWperfInstalled.description}\n\n`,
            });
        });
    });
});
