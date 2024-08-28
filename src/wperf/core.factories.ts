/**
 * Copyright (C) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';
import { Core } from './cores';

export const coreFactory = (options?: Partial<Core>): Core => ({
    number: faker.number.int(),
    model: faker.word.noun(),
    ...options,
});
