/**
 * Copyright (C) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';
import { SystemCheckValues } from './system-check-values';

export const systemCheckValuesFactory = (
    options?: Partial<SystemCheckValues>,
): SystemCheckValues => ({
    hasLlvmObjDumpOnPath: {
        name: faker.word.noun(),
        description: faker.word.noun(),
        isFound: false,
    },
    isWindowsOnArm: {
        name: faker.word.noun(),
        description: faker.word.noun(),
        isFound: false,
    },
    isWperfDriverInstalled: {
        name: faker.word.noun(),
        description: faker.word.noun(),
        isFound: false,
    },
    isWperfInstalled: {
        name: faker.word.noun(),
        description: faker.word.noun(),
        isFound: false,
    },
    ...options,
});
