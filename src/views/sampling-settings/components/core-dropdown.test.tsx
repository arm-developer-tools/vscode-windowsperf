/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import '@testing-library/jest-dom';
import { createCoreDropdownOptions } from './core-dropdown';
import { coreFactory } from '../../../wperf/core.factories';

describe('createCoreDropdownOptions', () => {
    it('returns correct options structure', () => {
        const core = coreFactory();
        const got = createCoreDropdownOptions([core]);

        expect(got).toEqual([
            {
                options: [
                    {
                        name: `Core ${core.number} - ${core.model}`,
                        value: `${core.number}`,
                    },
                ],
            },
        ]);
    });
});
