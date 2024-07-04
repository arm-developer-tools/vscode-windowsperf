/*
 * Copyright (c) 2024 Arm Limited
 */

import { getCpuInfo } from './cores';

const mockOS = jest.requireActual('os');

describe('getCpuInfo', () => {
    it('returns the core info', () => {
        const want = [{ number: 0, model: 'Test model' }];
        mockOS.cpus = jest.fn().mockReturnValue(want);

        const got = getCpuInfo();

        expect(got.length).toBe(1);
        expect(got).toEqual(want);
    });
});
